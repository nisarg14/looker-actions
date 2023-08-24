import * as winston from "winston"
import * as Hub from "../../hub"
import { MissingAuthError } from "../google/common/missing_auth_error"
import { GoogleOAuthHelper,UseGoogleOAuthHelper } from "../google/common/oauth_helper"
import { WrappedResponse } from "../google/common/wrapped_response"


const LOG_PREFIX = "[Tatvic DV360 Data Import]"

export class DV360DataAction 
    extends Hub.OAuthAction
    implements UseGoogleOAuthHelper {

  /*********** Action Properties ***********/       
  readonly name = "tatvic_dv360_data_import"
  readonly label = "Tatvic DV360 data Import"
  readonly iconName = "tatvic/.svg"
  readonly description = ""
  readonly supportedActionTypes = [Hub.ActionType.Query]
  readonly supportedFormats = [Hub.ActionFormat.Csv]
  readonly supportedFormattings = [Hub.ActionFormatting.Unformatted]
  readonly supportedVisualizationFormattings = [Hub.ActionVisualizationFormatting.Noapply]
  readonly supportedDownloadSettings = [Hub.ActionDownloadSettings.Url]
  readonly usesStreaming = true
  readonly requiredFields = []
  readonly params = []

  /*********** OAuth Properties ***********/
  readonly redirectUri = `${process.env.ACTION_HUB_BASE_URL}/actions/${encodeURIComponent(this.name)}/oauth_redirect`     
  readonly oauthClientId: string
  readonly oauthClientSecret: string
  readonly oauthScopes= ["https://www.googleapis.com/auth/display-video"]
  readonly oauthHelper: GoogleOAuthHelper

  /*********** Constructor & some helpers ***********/
  constructor(oauthClientId: string, oauthClientSecret: string ){
    super()
    this.oauthClientId = oauthClientId
    this.oauthClientSecret = oauthClientSecret
    this.oauthHelper = new GoogleOAuthHelper(this, this.makeLogger("oauth"))
  }

  makeLogger(webhookId = "") {
    return (level: string, ...rest: any[]) => {
      return winston.log(level, LOG_PREFIX, `[webhookID=${webhookId}]`, ...rest)
    }
  }

  makeOAuthClient(redirect?: string) {
    redirect = redirect ? redirect : this.redirectUri
    return this.oauthHelper.makeOAuthClient(redirect)
  }
  
  sanitizeError(err: any) {
    const configObjs = []
    if (err.config) {
      configObjs.push(err.config)
    }
    if (err.response && err.response.config) {
      configObjs.push(err.response.config)
    }
    for (const config of configObjs) {
      for (const prop of ["data", "body"]) {
        if (config[prop]) {
          config[prop] = "[REDACTED]"
        }
      }
    }
  }

  /*********** Endpoints for Hub.OAuthAction ***********/

  async oauthUrl(redirectUri: string, encryptedState: string) {
    return this.oauthHelper.oauthUrl(redirectUri, encryptedState)
  }

  async oauthFetchInfo(urlParams: { [key: string]: string }, redirectUri: string) {
    return this.oauthHelper.oauthFetchInfo(urlParams, redirectUri)
  }

  async oauthCheck(_request: Hub.ActionRequest) {
    // This part of Hub.OAuthAction is deprecated and unused
    return true
  }



  /*********** Main Action Endpoints ***********/



}