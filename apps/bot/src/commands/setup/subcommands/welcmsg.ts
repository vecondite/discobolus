import type { Output } from "../../types.js";

export default {
    skip: "subcommand."
}

export async function welcmsg(args: string[]){
    let output: Output;

    if(args.length==0){
        output={
            "error": true,
            "message": `Invalid Welcome Message Entered.`
        }
    }else{
        output = {
            "error": false,
            "message": `Welcome message set to ${args[0]}`
        };
    }

    return output;
}