package expo.modules.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class UsageStatsModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("UsageStats")

        /**
         * Query usage stats for the past [hours] hours.
         * Returns a list of { packageName, totalTimeInForeground } objects.
         */
        AsyncFunction("queryUsageStats") { hours: Double ->
            val context = appContext.reactContext
                ?: throw Exception("React context not available")

            val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val endTime = System.currentTimeMillis()
            val beginTime = endTime - (hours * 3_600_000L).toLong()

            val stats = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                beginTime,
                endTime
            )

            stats
                ?.filter { it.totalTimeInForeground > 0 }
                ?.map { stat ->
                    mapOf(
                        "packageName" to stat.packageName,
                        "totalTimeInForeground" to stat.totalTimeInForeground
                    )
                }
                ?: emptyList()
        }

        /**
         * Check whether the PACKAGE_USAGE_STATS (App Usage Access) permission
         * has been granted by the user.
         */
        AsyncFunction("hasPermission") {
            val context = appContext.reactContext
                ?: return@AsyncFunction false

            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
            mode == AppOpsManager.MODE_ALLOWED
        }

        /**
         * Open the system Usage Access Settings screen so the user can grant
         * the permission manually.
         */
        AsyncFunction("requestPermission") {
            val context = appContext.reactContext
                ?: throw Exception("React context not available")

            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }
}
