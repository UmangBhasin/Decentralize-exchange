import { ethers } from "ethers";
import RouterABI from "../../dex-backend/artifacts/contracts/DexRouter.sol/DexRouter.json";

const routerAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const getRouterContract = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const router = new ethers.Contract(
    routerAddress,
    RouterABI.abi,
    signer
  );

  return router;
};
