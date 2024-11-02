import { createApi } from '@reduxjs/toolkit/query/react';
import { HttpMethod } from '@educaition-react/ui/enums';
import { User, HttpBaseRequest } from '@educaition-react/ui/interfaces';
import { createHttpExtraOptions } from '@educaition-react/ui/utils';
import { axiosBaseQuery } from './base.service';

export const AuthService = createApi({
  reducerPath: 'AuthService',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    authenticate: builder.query<User, HttpBaseRequest<{ id: string; token: string }>>({
      query: ({ id, token }) => ({
        url: `/users/${id}/authenticate`,
        method: HttpMethod.POST,
        data: {
          token,
        },
        extraOptions: createHttpExtraOptions({
          notification: {
            autoHandleSuccess: false,
          },
        }),
      }),
    }),
    login: builder.mutation<User, HttpBaseRequest<{ email: string; password: string }>>({
      query: ({ email, password }) => ({
        url: '/login',
        method: HttpMethod.POST,
        data: { email, password },
        extraOptions: createHttpExtraOptions({
          notification: {
            translationMessageKey: 'http.message.login.{{status}}',
            autoHandleSuccess: true,
          },
        }),
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: HttpMethod.POST,
        extraOptions: createHttpExtraOptions({
          notification: {
            autoHandleSuccess: false,
          },
        }),
      }),
    }),
    changePassword: builder.mutation<
      User,
      HttpBaseRequest<{ userId: string; confirmPassword: string; currentPassword: string; newPassword: string }>
    >({
      query: ({ userId, confirmPassword, currentPassword, newPassword }) => ({
        url: `/users/${userId}/change_password`,
        method: HttpMethod.POST,
        data: {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        extraOptions: createHttpExtraOptions({
          notification: {
            translationMessageKey: 'http.message.changePassword.{{status}}',
          },
        }),
      }),
    }),
    uploadProfilePicture: builder.mutation<User, HttpBaseRequest<{ userId: string; formData: FormData }>>({
      query: ({ userId, formData }) => ({
        url: `/users/${userId}/upload_profile_picture`,
        method: HttpMethod.POST,
        data: formData,
      }),
    }),
    deleteProfilePicture: builder.query<User, HttpBaseRequest<{ userId: string }>>({
      query: ({ userId }) => ({
        url: `/users/${userId}/delete_profile_picture`,
        method: HttpMethod.GET,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useUploadProfilePictureMutation,
  useLazyDeleteProfilePictureQuery,
} = AuthService;
