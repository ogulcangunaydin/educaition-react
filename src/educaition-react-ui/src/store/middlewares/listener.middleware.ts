import { createListenerMiddleware } from '@reduxjs/toolkit';
// import { refetchNotificationsAction } from '../actions';
// import { changeSelectedAccountAction } from '../states';

export const ListenerMiddleware = createListenerMiddleware();

// ListenerMiddleware.startListening({
//   actionCreator: changeSelectedAccountAction,
//   effect: async (action, listenerApi) => {
//     // Seçili hesap değiştiği zaman bildirimler tekrar çekilir
//     listenerApi.dispatch(refetchNotificationsAction(action.payload));
//   },
// });
