import values from 'lodash/values';
import moment from 'moment';
import { types } from '../actions/notificationsActions';


export const initialState = {
    status: {
        fetching: null,
        fetched: null,
        error: null,
        cancelSource: null,
    },
    data: {
        notifications: {},
        notificationsSorted: [],
    },
    unreadCount: {
        status: {
            fetching: null,
            fetched: null,
            error: null,
            cancelSource: null,
        },
        data: {
            unreadCount: 0,
        },
    },
};

export function getSortedNotifications(notificationsObj) {
    const notificationsSorted = values(notificationsObj);
    notificationsSorted.sort((a, b) => moment(b.timestamp) - moment(a.timestamp));
    return notificationsSorted;
}

export function notificationsReducer(state = initialState, action) {
    switch (action.type) {
        case types.FETCHING_NOTIFICATIONS:
            return {
                ...state,
                status: {
                    ...state.status,
                    fetching: true,
                    fetched: false,
                    error: null,
                    cancelSource: action.cancelSource,
                },
            };
        case types.RECEIVED_NOTIFICATIONS: {
            const status = {
                ...state.status,
                fetching: false,
                fetched: true,
                error: null,
                cancelSource: null,
            };

            let changed = Object.keys(state.data.notifications).length !== action.notifications.length;

            const old = { ...state.data.notifications };
            const updated = {};
            action.notifications.forEach((n) => {
                if (old[n.id]) {
                    if (old[n.id].unread !== n.unread || old[n.id].deleted !== n.deleted) {
                        changed = true;
                    }
                }
                updated[n.id] = n;
            });

            // if no changes we only update the status
            if (!changed) {
                return {
                    ...state,
                    status,
                };
            }

            // if there are changes we update status and data
            return {
                ...state,
                status,
                data: {
                    ...state.data,
                    notifications: updated,
                    notificationsSorted: getSortedNotifications(updated),
                    nextPage: action.nextPage,
                    range: action.range,

                },
            };
        }
        case types.FETCH_NOTIFICATIONS_ERROR:
            return {
                ...state,
                status: {
                    ...state.status,
                    fetching: false,
                    fetched: false,
                    error: action.error,
                    cancelSource: null,
                },
            };
        case types.MARKING_NOTIFICATIONS_AS_READ: {
            const notifications = { ...state.data.notifications };
            let { unreadCount } = state.unreadCount.data;
            action.notifications.forEach((notification) => {
                if (notifications[notification.id].unread) {
                    unreadCount -= 1;
                }
                notifications[notification.id] = {
                    ...notifications[notification.id],
                    unread: false,
                };
            });
            return {
                ...state,
                data: {
                    notifications,
                    notificationsSorted: getSortedNotifications(notifications),
                },
                unreadCount: {
                    ...state.unreadCount,
                    data: {
                        unreadCount,
                    },
                },
            };
        }
        case types.MARK_NOTIFICATIONS_AS_READ_ERROR:
            return {
                ...state,
                status: {
                    ...state.status,
                    error: action.error,
                },
            };
        case types.MARKING_NOTIFICATIONS_AS_UNREAD: {
            const notifications = { ...state.data.notifications };
            let { unreadCount } = state.unreadCount.data;
            action.notifications.forEach((notification) => {
                if (!notifications[notification.id].unread) {
                    unreadCount += 1;
                }
                notifications[notification.id] = {
                    ...notifications[notification.id],
                    unread: true,
                };
            });

            return {
                ...state,
                data: {
                    notifications,
                    notificationsSorted: getSortedNotifications(notifications),
                },
                unreadCount: {
                    ...state.unreadCount,
                    data: {
                        unreadCount,
                    },
                },
            };
        }
        case types.MARK_NOTIFICATIONS_AS_UNREAD_ERROR:
            return {
                ...state,
                status: {
                    ...state.status,
                    error: action.error,
                },
            };
        case types.MARKING_ALL_NOTIFICATIONS_AS_READ: {
            const notifications = { ...state.data.notifications };
            Object.keys(notifications).forEach((id) => {
                notifications[id] = {
                    ...notifications[id],
                    unread: false,
                };
            });

            return {
                ...state,
                data: {
                    notifications,
                    notificationsSorted: getSortedNotifications(notifications),
                },
                unreadCount: {
                    ...state.unreadCount,
                    data: {
                        unreadCount: 0,
                    },
                },
            };
        }
        case types.MARK_ALL_NOTIFICATIONS_AS_READ_ERROR:
            return {
                ...state,
                status: {
                    ...state.status,
                    error: action.error,
                },
            };
        case types.REMOVING_NOTIFICATIONS: {
            const notifications = { ...state.data.notifications };
            let { unreadCount } = state.unreadCount.data;
            action.notifications.forEach((notification) => {
                if (notifications[notification.id].unread) {
                    unreadCount -= 1;
                }
                delete notifications[notification.id];
            });
            return {
                ...state,
                data: {
                    notifications,
                    notificationsSorted: getSortedNotifications(notifications),
                },
                unreadCount: {
                    ...state.unreadCount,
                    data: {
                        unreadCount,
                    },
                },
            };
        }
        case types.REMOVE_NOTIFICATIONS_ERROR:
            return {
                ...state,
                status: {
                    ...state.status,
                    error: action.error,
                },
            };
        case types.FETCHING_NOTIFICATIONS_UNREAD_COUNT:
            return {
                ...state,
                unreadCount: {
                    ...state.unreadCount,
                    status: {
                        ...state.unreadCount.status,
                        fetching: true,
                        fetched: false,
                        cancelSource: action.cancelSource,
                    },
                },
            };
        case types.RECEIVED_NOTIFICATIONS_UNREAD_COUNT:
            return {
                ...state,
                unreadCount: {
                    ...state.unreadCount,
                    status: {
                        ...state.unreadCount.status,
                        fetching: false,
                        fetched: true,
                        cancelSource: null,
                    },
                    data: {
                        unreadCount: action.unreadCount,
                    },
                },
            };
        case types.FETCH_NOTIFICATIONS_UNREAD_COUNT_ERROR:
            return {
                ...state,
                unreadCount: {
                    ...state.unreadCount,
                    status: {
                        fetching: false,
                        fetched: false,
                        error: action.error,
                        cancelSource: null,
                    },
                },
            };
        case types.USER_LOGGED_OUT:
            return initialState;
        default:
            return state;
    }
}
