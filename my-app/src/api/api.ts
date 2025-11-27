/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsRoute {
  Delay?: number;
  Description?: string;
  Distance?: number;
  ImageURL?: string;
  RouteID?: number;
  Status?: string;
  Title?: string;
}

export interface DtoAuthResponse {
  access_token?: string;
  expires_in?: number;
  message?: string;
  refresh_token?: string;
  token_type?: string;
  user?: DtoUserResponse;
}

export interface DtoErrorResponse {
  error?: string;
}

export interface DtoMessageResponse {
  message?: string;
}

export interface DtoRefreshTokenRequest {
  refresh_token: string;
}

export interface DtoRouteInfo {
  description?: string;
  distance?: number;
  image_url?: string;
  route_id?: number;
  status?: string;
  title?: string;
}

export interface DtoRouteSpeedRequestInfo {
  arrival_date?: string;
  ship_speed?: number;
}

export interface DtoSignInRequest {
  login: string;
  password: string;
}

export interface DtoSignUpRequest {
  /**
   * @minLength 3
   * @maxLength 50
   */
  login: string;
  /** @minLength 6 */
  password: string;
}

export interface DtoSpeedRequest {
  completion_date?: string;
  creation_date?: string;
  creator_login?: string;
  departure_date?: string;
  formation_date?: string;
  id?: number;
  moderator_login?: string;
  status?: string;
}

export interface DtoSpeedRequestDetailedResponse {
  result?: number;
  route_req?: DtoRouteSpeedRequestInfo[];
  routes?: DtoRouteInfo[];
  speed_request?: DtoSpeedRequest;
}

export interface DtoUpdateSpeedRequest {
  departure_date?: string;
}

export interface DtoUpdateUserRequest {
  login?: string;
  password?: string;
}

export interface DtoUserResponse {
  is_moderator?: boolean;
  login?: string;
  user_id?: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface RequestParamsWithBody extends RequestParams {
  body?: unknown;
}

export interface UpdateSpeedRequestParams extends RequestParams {
  body?: {
    departure_date?: string;
  };
}

export interface UpdateRouteSpeedRequestParams extends RequestParams {
  body?: {
    speed_request_id?: number;
    route_id?: number;
    arrival_date?: string;
  };
}

export interface DeleteRouteSpeedRequestParams extends RequestParams {
  body?: {
    speed_request_id?: number;
    route_id?: number;
  };
}

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title RIP API
 * @version 1.0
 * @baseUrl http://localhost:8080/api
 * @contact
 *
 * Route Information Platform API
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description Get new access token using refresh token
     *
     * @tags auth
     * @name RefreshCreate
     * @summary Refresh JWT tokens
     * @request POST:/auth/refresh
     */
    refreshCreate: (
      request: DtoRefreshTokenRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoAuthResponse, DtoErrorResponse>({
        path: `/auth/refresh`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Authenticate user and return JWT tokens
     *
     * @tags auth
     * @name SigninCreate
     * @summary User authentication
     * @request POST:/auth/signin
     */
    signinCreate: (request: DtoSignInRequest, params: RequestParams = {}) =>
      this.request<DtoAuthResponse, DtoErrorResponse>({
        path: `/auth/signin`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Invalidate user tokens
     *
     * @tags auth
     * @name SignoutCreate
     * @summary User logout
     * @request POST:/auth/signout
     * @secure
     */
    signoutCreate: (params: RequestParams = {}) =>
      this.request<DtoMessageResponse, DtoErrorResponse>({
        path: `/auth/signout`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Register a new user
     *
     * @tags auth
     * @name SignupCreate
     * @summary User registration
     * @request POST:/auth/signup
     */
    signupCreate: (request: DtoSignUpRequest, params: RequestParams = {}) =>
      this.request<DtoAuthResponse, DtoErrorResponse>({
        path: `/auth/signup`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  draft = {
    /**
     * @description Add route to draft. Create new darft if darft not existing. For authentificated users (client, moderator)
     *
     * @tags routes
     * @name AddrouteCreate
     * @summary Add route to draft
     * @request POST:/draft/addroute/{route_id}
     * @secure
     */
    addrouteCreate: (routeId: number, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/draft/addroute/${routeId}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  routes = {
    /**
     * @description Get all routes list with optional filters
     *
     * @tags routes
     * @name RoutesList
     * @summary Get all routes
     * @request GET:/routes
     */
    routesList: (
      query?: {
        /** Minimum distance filter */
        min_distance?: number;
        /** Maximum distance filter */
        max_distance?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsRoute[], any>({
        path: `/routes`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create new route. Only for moderator
     *
     * @tags routes
     * @name RoutesCreate
     * @summary Create new route
     * @request POST:/routes
     * @secure
     */
    routesCreate: (params: RequestParams = {}) =>
      this.request<DsRoute, any>({
        path: `/routes`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get route information by ID
     *
     * @tags routes
     * @name RoutesDetail
     * @summary Get route by ID
     * @request GET:/routes/{route_id}
     */
    routesDetail: (routeId: number, params: RequestParams = {}) =>
      this.request<DsRoute, any>({
        path: `/routes/${routeId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update existing route. Only for moderator
     *
     * @tags routes
     * @name RoutesUpdate
     * @summary Update existing route
     * @request PUT:/routes/{route_id}
     * @secure
     */
    routesUpdate: (routeId: string, params: RequestParams = {}) =>
      this.request<DsRoute, any>({
        path: `/routes/${routeId}`,
        method: "PUT",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete existing route. Only for moderator
     *
     * @tags routes
     * @name RoutesDelete
     * @summary Delete existing route
     * @request DELETE:/routes/{route_id}
     * @secure
     */
    routesDelete: (routeId: number, params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/routes/${routeId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Upload route image. Add new image if route doesn`t have one or change image. Only for moderator
     *
     * @tags routes
     * @name ImageCreate
     * @summary Upload route image
     * @request POST:/routes/{route_id}/image
     * @secure
     */
    imageCreate: (routeId: number, data?: any, params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/routes/${routeId}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  routespeedrequests = {
  /**
   * @description Upadet field arrival date in route speed request. For authentificated users only.
   *
   * @tags routespeedrequests
   * @name RoutespeedrequestsUpdate
   * @summary Update route speed request
   * @request PUT:/routespeedrequests
   * @secure
   */
  routespeedrequestsUpdate: (params: UpdateRouteSpeedRequestParams = {}) =>
    this.request<object, void>({
      path: `/routespeedrequests`,
      method: "PUT",
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    }),

  /**
   * @description Remove route from speed request. For authentificated users only.
   *
   * @tags routespeedrequests
   * @name RoutespeedrequestsDelete
   * @summary Remove route speed request
   * @request DELETE:/routespeedrequests
   * @secure
   */
  routespeedrequestsDelete: (params: DeleteRouteSpeedRequestParams = {}) =>
    this.request<object, void>({
      path: `/routespeedrequests`,
      method: "DELETE",
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    }),
  };

  speedrequests = {
    /**
     * @description Get speed requests list. For authentificated users only.
     *
     * @tags speedrequests
     * @name SpeedrequestsList
     * @summary Get speed requests list
     * @request GET:/speedrequests
     * @secure
     */
    speedrequestsList: (
      query?: {
        /**
         * Date From
         * @format date
         */
        date_from?: string;
        /** Date To */
        date_to?: string;
        /** Status */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DtoSpeedRequest[], any>({
        path: `/speedrequests`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get darft infomation. Returns speedrequestid nil and count 0 for guest.
     *
     * @tags speedrequests
     * @name DraftList
     * @summary Get darft information
     * @request GET:/speedrequests/draft
     * @secure
     */
    draftList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/speedrequests/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get speed request by ID. For authentificated users only. Client can see only their speed requests
     *
     * @tags speedrequests
     * @name SpeedrequestsDetail
     * @summary Get speed request by ID
     * @request GET:/speedrequests/{speed_request_id}
     * @secure
     */
    speedrequestsDetail: (speedRequestId: number, params: RequestParams = {}) =>
      this.request<DtoSpeedRequestDetailedResponse, any>({
        path: `/speedrequests/${speedRequestId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

     /**
     * @description Update speed request. For authentificated users only.
     *
     * @tags speedrequests
     * @name SpeedrequestsUpdate
     * @summary Update speed request
     * @request PUT:/speedrequests/{speed_request_id}
     * @secure
     */
    speedrequestsUpdate: (speedRequestId: number, params: UpdateSpeedRequestParams = {}) =>
      this.request<DtoUpdateSpeedRequest, any>({
        path: `/speedrequests/${speedRequestId}`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete speed request. For authentificated users only.
     *
     * @tags speedrequests
     * @name SpeedrequestsDelete
     * @summary Delete speed request
     * @request DELETE:/speedrequests/{speed_request_id}
     * @secure
     */
    speedrequestsDelete: (speedRequestId: number, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/speedrequests/${speedRequestId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Complete speed requests. For moderators only.
     *
     * @tags speedrequests
     * @name CompleteUpdate
     * @summary Complete speed request
     * @request PUT:/speedrequests/{speed_request_id}/complete
     * @secure
     */
    completeUpdate: (speedRequestId: number, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/speedrequests/${speedRequestId}/complete`,
        method: "PUT",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Submit speed request. For authentificated users only.
     *
     * @tags speedrequests
     * @name SubmitUpdate
     * @summary Sumbit speed request
     * @request PUT:/speedrequests/{speed_request_id}/submit
     * @secure
     */
    submitUpdate: (speedRequestId: number, params: RequestParams = {}) =>
      this.request<DtoSpeedRequestDetailedResponse, any>({
        path: `/speedrequests/${speedRequestId}/submit`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Get current authenticated user information
     *
     * @tags users
     * @name GetUsers
     * @summary Get current user profile
     * @request GET:/users/me
     * @secure
     */
    getUsers: (params: RequestParams = {}) =>
      this.request<DtoUserResponse, DtoErrorResponse>({
        path: `/users/me`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update current user information
     *
     * @tags users
     * @name PutUsers
     * @summary Update current user
     * @request PUT:/users/me
     * @secure
     */
    putUsers: (request: DtoUpdateUserRequest, params: RequestParams = {}) =>
      this.request<DtoMessageResponse, DtoErrorResponse>({
        path: `/users/me`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
