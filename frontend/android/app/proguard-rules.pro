# Capacitor & Native Plugins ProGuard Rules
-keep class com.getcapacitor.** { *; }
-keep class com.cashbuddy.app.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve Reflection & Annotations for Capacitor plugins
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
