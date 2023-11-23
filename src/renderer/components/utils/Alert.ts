import { Notyf, NotyfNotification, INotyfIcon } from 'notyf'

export default class Alert {
    alert: Notyf
    message: string
    duration: number
    
    constructor() {
        if(typeof window === 'undefined') return

        this.alert = new Notyf({
            duration: 4000,
            position: {
                x: 'center',
                y: 'top',
            },
            ripple: false,
            dismissible: true,
            types: [
                {
                    type: 'warning',
                    background: '#fb923c',
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>`
                },
                {
                    type: 'info',
                    background: '#0ea5e9',
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    `
                },
                {
                    type: 'error',
                    background: '#ef4444',
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                    </svg>
                    `,
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
        if(!this.alert) return

        return this.alert.success({ message, duration })
    }

    _warning(message: string, duration?: number): NotyfNotification {
        if(!this.alert) return

        return this.alert.open({
            type: 'warning',
            message,
            duration
        })
    }

    _info(message: string, duration?: number): NotyfNotification {
        if(!this.alert) return

        return this.alert.open({
            type: 'info',
            message,
            duration
        })
    }

    _error(message: string, duration?: number): NotyfNotification {
        if(!this.alert) return

        return this.alert.error({ message, duration })
    }
}