/**
 * RevenueCat IAP integration for Capacitor native apps.
 * When running in the native app (iOS/Android), use this instead of Stripe.
 *
 * Setup:
 * 1. Create RevenueCat project at app.revenuecat.com
 * 2. Add iOS app (App Store Connect) and Android app (Google Play)
 * 3. Create products in App Store Connect + Google Play Console
 * 4. Create Offering "default" with packages: teacher_monthly, teacher_yearly, student_monthly, student_yearly
 * 5. Create Entitlement "all_missions" and attach packages
 * 6. Set REVENUECAT_API_KEY in your build (or pass to init)
 */
(function(){
  var PLUGIN = null;
  var CONFIGURED = false;
  var ENTITLEMENT_ID = 'all_missions';

  var PLAN_TO_PACKAGE = {
    single_teacher_monthly: 'teacher_monthly',
    single_teacher_yearly: 'teacher_yearly',
    student_monthly: 'student_monthly',
    student_yearly: 'student_yearly'
  };

  function isNative(){
    return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
  }

  function getPlugin(){
    if (PLUGIN) return PLUGIN;
    if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Purchases) {
      PLUGIN = Capacitor.Plugins.Purchases;
      return PLUGIN;
    }
    return null;
  }

  function getApiKey(){
    if (typeof window !== 'undefined' && window.GS_IAP_CONFIG && window.GS_IAP_CONFIG.revenueCatApiKey) {
      return window.GS_IAP_CONFIG.revenueCatApiKey;
    }
    return '';
  }

  function init(appUserId){
    if (!isNative() || CONFIGURED) return Promise.resolve(false);
    var key = getApiKey();
    if (!key) return Promise.resolve(false);

    var Purchases = getPlugin();
    if (!Purchases) return Promise.resolve(false);

    return Purchases.configure({
      apiKey: key,
      appUserID: appUserId || ''
    }).then(function(){
      CONFIGURED = true;
      return true;
    }).catch(function(){
      return false;
    });
  }

  function syncEntitlementToAccount(getAccount, grantPaid){
    if (!isNative() || !CONFIGURED) return Promise.resolve();
    var Purchases = getPlugin();
    if (!Purchases) return Promise.resolve();

    return Purchases.getCustomerInfo().then(function(result){
      var info = result && result.customerInfo;
      if (!info || !info.entitlements) return;
      var ent = info.entitlements[ENTITLEMENT_ID];
      if (ent && ent.isActive && grantPaid) {
        grantPaid('paid');
      }
    }).catch(function(){});
  }

  function purchase(plan, onSuccess, onError){
    if (!isNative() || !CONFIGURED) {
      if (onError) onError('IAP not available');
      return Promise.reject(new Error('IAP not available'));
    }

    var packageId = PLAN_TO_PACKAGE[plan];
    if (!packageId) {
      if (onError) onError('Unknown plan: ' + plan);
      return Promise.reject(new Error('Unknown plan'));
    }

    var Purchases = getPlugin();
    if (!Purchases) {
      if (onError) onError('Purchases plugin not loaded');
      return Promise.reject(new Error('Plugin not loaded'));
    }

    return Purchases.getOfferings().then(function(result){
      var offerings = result && result.offerings;
      if (!offerings) throw new Error('No offerings');
      var current = offerings.current;
      if (!current) throw new Error('No current offering');
      var pkg = current.availablePackages && current.availablePackages.find(function(p){ return p.identifier === packageId; });
      if (!pkg) pkg = current.monthly || current.annual || current.lifetime || (current.availablePackages && current.availablePackages[0]);
      if (!pkg) throw new Error('Package not found: ' + packageId);
      return Purchases.purchasePackage({ aPackage: pkg });
    }).then(function(purchaseResult){
      var info = purchaseResult && purchaseResult.customerInfo;
      if (info && info.entitlements && info.entitlements[ENTITLEMENT_ID] && info.entitlements[ENTITLEMENT_ID].isActive) {
        if (onSuccess) onSuccess(info);
        return info;
      }
      if (onSuccess) onSuccess(purchaseResult);
      return purchaseResult;
    }).catch(function(err){
      var msg = err && (err.message || err.userInfo?.message || err.toString()) || 'Purchase failed';
      if (onError) onError(msg);
      throw err;
    });
  }

  function restore(onSuccess, onError){
    if (!isNative() || !CONFIGURED) {
      if (onError) onError('IAP not available');
      return Promise.reject(new Error('IAP not available'));
    }
    var Purchases = getPlugin();
    if (!Purchases) {
      if (onError) onError('Plugin not loaded');
      return Promise.reject(new Error('Plugin not loaded'));
    }
    return Purchases.restorePurchases().then(function(result){
      var info = result && result.customerInfo;
      if (onSuccess) onSuccess(info);
      return info;
    }).catch(function(err){
      var msg = err && (err.message || err.toString()) || 'Restore failed';
      if (onError) onError(msg);
      throw err;
    });
  }

  window.GS_IAP = {
    isNative: isNative,
    isConfigured: function(){ return CONFIGURED; },
    init: init,
    syncEntitlementToAccount: syncEntitlementToAccount,
    purchase: purchase,
    restore: restore,
    PLAN_TO_PACKAGE: PLAN_TO_PACKAGE
  };
})();
