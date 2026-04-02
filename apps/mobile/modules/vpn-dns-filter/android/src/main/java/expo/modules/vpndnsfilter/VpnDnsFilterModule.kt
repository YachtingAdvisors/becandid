package expo.modules.vpndnsfilter

import android.content.Intent
import android.net.VpnService
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class VpnDnsFilterModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("VpnDnsFilter")

        AsyncFunction("start") {
            val context = appContext.reactContext ?: throw Exception("Context not available")

            // Check if VPN permission is granted
            val intent = VpnService.prepare(context)
            if (intent != null) {
                // Need to request VPN permission
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                return@AsyncFunction
            }

            // Start the VPN service
            val serviceIntent = Intent(context, DnsVpnService::class.java)
            serviceIntent.action = "START"
            context.startForegroundService(serviceIntent)
        }

        AsyncFunction("stop") {
            val context = appContext.reactContext ?: throw Exception("Context not available")
            val serviceIntent = Intent(context, DnsVpnService::class.java)
            serviceIntent.action = "STOP"
            context.startService(serviceIntent)
        }

        AsyncFunction("isActive") {
            DnsVpnService.isRunning
        }

        AsyncFunction("getRecentQueries") { limit: Int ->
            DnsVpnService.getRecentQueries(limit).map { query ->
                mapOf(
                    "domain" to query.domain,
                    "timestamp" to query.timestamp
                )
            }
        }
    }
}
