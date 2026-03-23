// src/revenuecat.js
import { Purchases } from '@revenuecat/purchases-js';

let purchasesInstance = null;

export const initRevenueCat = async () => {
  if (purchasesInstance) return purchasesInstance;

  const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY;

  if (!apiKey) {
    console.error('❌ VITE_REVENUECAT_PUBLIC_API_KEY não encontrada no .env.local');
    return null;
  }

  purchasesInstance = Purchases.configure(apiKey, 'anonymous_user');
  console.log('✅ RevenueCat iniciado com sucesso');
  return purchasesInstance;
};

export const getPurchases = () => {
  if (!purchasesInstance) throw new Error('Chame initRevenueCat() primeiro!');
  return purchasesInstance;
};

export const checkProAccess = async () => {
  try {
    const purchases = getPurchases();
    const customerInfo = await purchases.getCustomerInfo();
    const isPro = !!customerInfo.entitlements.active['Oráculo da sorte Pro']?.isActive;
    console.log('🔑 Oráculo da sorte Pro ativo?', isPro);
    return isPro;
  } catch (e) {
    console.error('Erro ao verificar acesso Pro:', e);
    return false;
  }
};
export const getOfferings = async () => {
  try {
    const purchases = getPurchases();
    const offerings = await purchases.getOfferings();
    console.log('🎯 Offerings encontrados:', offerings);
    return offerings;
  } catch (e) {
    console.error('Erro ao buscar offerings:', e);
    return null;
  }
};

export const purchasePackage = async (packageId) => {
  try {
    const purchases = getPurchases();
    const offerings = await purchases.getOfferings();
    const defaultOffering = offerings.current;

    if (!defaultOffering) {
      console.error('❌ Nenhum offering encontrado');
      return null;
    }

    // Encontra o package certo
    const pkg = defaultOffering.availablePackages.find(
      (p) => p.packageType === packageId || p.identifier === packageId
    );

    if (!pkg) {
      console.error('❌ Package não encontrado:', packageId);
      console.log('Packages disponíveis:', defaultOffering.availablePackages.map(p => p.identifier));
      return null;
    }

    console.log('🛒 Iniciando compra:', pkg.identifier);
    const result = await purchases.purchase({ rcPackage: pkg });
    console.log('✅ Compra realizada!', result);
    return result;
  } catch (e) {
    if (e.errorCode === 1) {
      console.log('👤 Utilizador cancelou a compra');
    } else {
      console.error('❌ Erro na compra:', e);
    }
    return null;
  }
};