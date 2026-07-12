export const CORIDOR_HOME_DOMAIN =
  process.env.NEXT_PUBLIC_CORIDOR_HOME_DOMAIN || "sep.coridor.fun";

/** Blend USDC on Stellar testnet (Coridor anchor asset). */
export const CORIDOR_USDC_ISSUER =
  "GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56";

export function getCoridorDomain(): string {
  return CORIDOR_HOME_DOMAIN;
}
