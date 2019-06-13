import {Utils} from "./utils";
import fs = require("fs");


class GenerateConfig {

  async generateConfig(stackName: string, filePath: string, constName: string) {

    const outputs = await Utils.getStackOutputs(stackName);
    const outputsByName = new Map<string, string>();
    for (let output of outputs) {
      outputsByName.set(output.OutputKey!, output.OutputValue!);
    }

    const region = outputsByName.get("RegionOutput");
    const cognitoDomain = outputsByName.get("CognitoDomainOutput");
    const userPoolId = outputsByName.get("UserPoolIdOutput");
    const appClientId = outputsByName.get("AppClientIdOutput");
    const apiURL = outputsByName.get("APIUrlOutput");

    const autoGenConfigFile = `// this file is auto generated, do not edit it directly
export interface AutoGeneratedConfigParams {
  cognitoDomain?: string;
  region?: string;
  cognitoUserPoolId?: string;
  cognitoUserPoolAppClientId?: string;
  apiUrl?: string;
}
export const ${constName}: AutoGeneratedConfigParams = {
  cognitoDomain: "${cognitoDomain}",
  region: "${region}",
  cognitoUserPoolId: "${userPoolId}",
  cognitoUserPoolAppClientId: "${appClientId}",
  apiUrl: "${apiURL}",
};
`;

    console.log(autoGenConfigFile);

    fs.writeFileSync(filePath, autoGenConfigFile);

    console.log(`
IdP Settings:

  Okta
  ----
  
  Update Okta App settings to:

  - Single sign on URL: https://${cognitoDomain}/saml2/idpresponse
  - Audience URI (SP Entity ID): urn:amazon:cognito:sp:${userPoolId}
  - Group Attribute Statements (optional): Name=groups, Filter=Starts With (prefix) / Regex (.*)   
    `)

  }
}

const stackName = process.argv[2];
if(!stackName){
  throw new Error("stack name is required");
}
const filePath = process.argv[3];
if(!stackName){
  throw new Error("file path is required");
}

new GenerateConfig().generateConfig(stackName, filePath, "autoGenConfigParams");
