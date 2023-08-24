import { Credentials } from "google-auth-library"
import { displayvideo_v1, google } from "googleapis"
import * as Hub from "../../../hub"
import { Logger } from "../../google/common/logger"
import { MissingAuthError } from "../../google/common/missing_auth_error"
import { MissingRequiredParamsError } from "../../google/common/missing_required_params_error"
import { safeParseJson } from "../../google/common/utils"
import { DV360DataAction } from "../dv360"


interface dv360UserState {
    tokens: Credentials
    redirect: string
}

export class DV360ActionWorker {
  
  static async fromHubRequest(
    hubRequest: Hub.ActionRequest,
    actionInstance: DV360DataAction,
    logger: Logger,
  ) {
    const dvWorker = new DV360ActionWorker(hubRequest,actionInstance, logger)
    return dvWorker
  }

  dvClient: displayvideo_v1.Displayvideo
  userState: dv360UserState
  formParams: any

  constructor(
    readonly hubRequest: Hub.ActionRequest,
    readonly actionInstance: DV360DataAction,
    readonly log: Logger,
  ) {
    const tmpState = safeParseJson(hubRequest.params.state_json)

    if (!tmpState || !tmpState.tokens || !tmpState.redirect) {
        throw new MissingAuthError("User state was missing or did not contain tokens & redirect")
    }

    this.userState = tmpState
    this.formParams = hubRequest.formParams
    this.dvClient = this.makeDVClient()
  }

  get redirect(){
    return this.userState.redirect
  }

  get tokens(){
    return this.userState.tokens
  }

  makeDVClient() {
    const oauthClient = this.actionInstance.makeOAuthClient(this.redirect)
    oauthClient.setCredentials(this.tokens)
    return google.displayvideo({
        version: "v1",
        auth: oauthClient
    })
  }


}