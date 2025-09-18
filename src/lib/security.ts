import { ethers } from "ethers";

export const validateAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

export const validateAmount = (amount: string, balance: string): boolean => {
  try {
    const amountBN = ethers.parseEther(amount);
    const balanceBN = ethers.parseEther(balance);
    return amountBN.gt(0) && amountBN.lte(balanceBN);
  } catch {
    return false;
  }
};

export const validateSignature = async (
  message: string,
  signature: string,
  address: string,
): Promise<boolean> => {
  try {
    const signerAddr = ethers.verifyMessage(message, signature);
    return signerAddr.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, "");
};
