import { Notyf, NotyfNotification } from 'notyf'

export default class Alert {
    alert: Notyf
    message: string
    duration: number
    
    constructor() {
        this.alert = new Notyf({
            duration: 4000,
            position: {
                x: 'center',
                y: 'top',
            },
            types: [
                {
                    type: 'warning',
                    background: 'orange',
                    icon: false
                },
                {
                    type: 'info',
                    background: 'blue',
                    icon: false
                }
            ]
        })
    }

    static success(message: string, duration?: number): NotyfNotification {
        return new Alert()._success(message, duration)
    }

    static warning(message: string, duration?: number): NotyfNotification {
        return new Alert()._warning(message, duration)
    }

    static info(message: string, duration?: number): NotyfNotification {
        return new Alert()._info(message, duration)
    }

    static error(message: string, duration?: number): NotyfNotification {
        return new Alert()._error(message, duration)
    }

    _success(message: string, duration?: number): NotyfNotification {
        return this.alert.success({ message, duration })
    }

    _warning(message: string, duration?: number): NotyfNotification {
         return this.alert.open({
            type: 'warning',
            message,
            duration
        })
    }

    _info(message: string, duration?: number): NotyfNotification {
         return this.alert.open({
            type: 'info',
            message,
            duration
        })
    }

    _error(message: string, duration?: number): NotyfNotification {
         return this.alert.error({ message, duration })
    }
}