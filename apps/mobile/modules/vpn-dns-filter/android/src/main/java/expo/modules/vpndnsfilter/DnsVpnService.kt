package expo.modules.vpndnsfilter

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.util.concurrent.ConcurrentLinkedQueue

data class DnsQuery(val domain: String, val timestamp: Long)

class DnsVpnService : VpnService() {

    companion object {
        var isRunning = false
        private val recentQueries = ConcurrentLinkedQueue<DnsQuery>()
        private const val MAX_QUERIES = 500
        private const val CHANNEL_ID = "vpn_dns_filter"

        fun getRecentQueries(limit: Int): List<DnsQuery> {
            return recentQueries.toList().takeLast(limit)
        }
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isActive = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "STOP" -> {
                stopVpn()
                stopSelf()
            }
            else -> {
                createNotificationChannel()
                startForeground(1, createNotification())
                startVpn()
            }
        }
        return START_STICKY
    }

    private fun startVpn() {
        if (isActive) return

        try {
            val builder = Builder()
                .setSession("Be Candid DNS Monitor")
                .addAddress("10.0.0.2", 32)
                .addDnsServer("8.8.8.8")
                .addDnsServer("8.8.4.4")
                .addRoute("0.0.0.0", 0)
                .setMtu(1500)
                .setBlocking(true)

            vpnInterface = builder.establish()
            isActive = true
            isRunning = true

            // Start DNS monitoring thread
            Thread { monitorDns() }.start()
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
        }
    }

    private fun monitorDns() {
        val input = FileInputStream(vpnInterface?.fileDescriptor ?: return)
        val buffer = ByteArray(32767)

        while (isActive) {
            try {
                val length = input.read(buffer)
                if (length > 0) {
                    val packet = ByteBuffer.wrap(buffer, 0, length)
                    parseDnsQuery(packet)
                }
            } catch (e: Exception) {
                if (isActive) {
                    // Retry
                    Thread.sleep(100)
                }
            }
        }
    }

    private fun parseDnsQuery(packet: ByteBuffer) {
        try {
            // Skip IP header (20 bytes for IPv4)
            if (packet.remaining() < 28) return

            val version = (packet.get(0).toInt() shr 4) and 0xF
            if (version != 4) return // Only IPv4

            val headerLength = (packet.get(0).toInt() and 0xF) * 4
            val protocol = packet.get(9).toInt() and 0xFF

            // Only UDP (protocol 17)
            if (protocol != 17) return

            // Check destination port (DNS = 53)
            val destPort = ((packet.get(headerLength + 2).toInt() and 0xFF) shl 8) or
                          (packet.get(headerLength + 3).toInt() and 0xFF)
            if (destPort != 53) return

            // Parse DNS query name from UDP payload
            val dnsStart = headerLength + 8 + 12 // IP header + UDP header + DNS header
            if (dnsStart >= packet.remaining()) return

            val domain = parseDnsName(packet.array(), dnsStart)
            if (domain.isNotEmpty() && domain.contains('.')) {
                // Add to recent queries (thread-safe)
                recentQueries.add(DnsQuery(domain, System.currentTimeMillis()))

                // Keep queue bounded
                while (recentQueries.size > MAX_QUERIES) {
                    recentQueries.poll()
                }
            }
        } catch (e: Exception) {
            // Silently skip malformed packets
        }
    }

    private fun parseDnsName(data: ByteArray, offset: Int): String {
        val parts = mutableListOf<String>()
        var pos = offset

        while (pos < data.size) {
            val len = data[pos].toInt() and 0xFF
            if (len == 0) break
            if (len > 63) break // Compression pointer, stop

            pos++
            if (pos + len > data.size) break

            parts.add(String(data, pos, len))
            pos += len
        }

        return parts.joinToString(".")
    }

    private fun stopVpn() {
        isActive = false
        isRunning = false
        vpnInterface?.close()
        vpnInterface = null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "DNS Monitoring",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Be Candid is monitoring your digital wellness"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("Be Candid")
                .setContentText("Digital wellness monitoring active")
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle("Be Candid")
                .setContentText("Digital wellness monitoring active")
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .build()
        }
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }
}
