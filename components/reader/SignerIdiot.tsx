
import { useSignTypedData, } from "wagmi";

const SignerIdiot = ({ value, domain, types }: any) => {


    const [{ data: signature, error, loading }, signTypedData] = useSignTypedData(
        {
          domain,
          types,
          value,
        }
    );
    
    const callback = () => signTypedData(); 
    

    return null; 
}

export default SignerIdiot;