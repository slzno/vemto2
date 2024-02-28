import Alert from "@Renderer/components/utils/Alert"

export interface LicenseData {
    email: string
    code: string
    isLifetime: boolean
    endsAt: string
    expired: boolean
}

export default class LicenseHandler {
    isActive(): boolean {
        return !this.isExpired()
    }

    isExpired(): boolean {
        if(!this.hasLicense()) {
            return true
        }

        if (this.isLifetime()) {
            return false
        }

        if (this.isExpiredByEndsAt()) {
            return true
        }

        const licenseData = this.getLicense()

        if (licenseData) {
            return licenseData.expired
        }

        return true
    }

    isExpiredByEndsAt(): boolean {
        const licenseData = this.getLicense()

        if (licenseData) {
            const endsAt = new Date(licenseData.endsAt)
            const now = new Date()

            return endsAt < now
        }

        return true
    }

    isLifetime(): boolean {
        const licenseData = this.getLicense()

        if (licenseData) {
            return licenseData.isLifetime
        }

        return false
    }

    async checkLicense(email:string, license: string): Promise<boolean> {
        const response = await fetch('http://localhost:8000/api/v2/licenses/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                license
            })
        })

        const data = await this.treatResponse(response)

        if(!data) return false

        if(data.occupied) {
            this.removeLicense()
            return false
        }

        this.saveLicense(data)
    }

    async activateLicense(email:string, license: string): Promise<boolean> {
        const response = await fetch('http://localhost:8000/api/v2/licenses/activate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                license
            })
        })

        const licenseData = await this.treatResponse(response)

        if (licenseData) {
            this.saveLicense(licenseData)

            return true
        }

        return false
    }

    async revokeLicense(email:string, license: string): Promise<boolean> {
        const response = await fetch('http://localhost:8000/api/v2/licenses/revoke', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                license
            })
        })

        const data = await this.treatResponse(response)

        if (data) {
            this.removeLicense()

            return true
        }

        return false
    }

    hasLicense(): boolean {
        return !!this.getLicense()
    }

    getLicense(): LicenseData {
        const licenseData = localStorage.getItem('licenseData')

        if (licenseData) {
            return JSON.parse(licenseData)
        }

        return null
    }

    saveLicense(licenseData: LicenseData): void {
        localStorage.setItem('licenseData', JSON.stringify(licenseData))
    }

    removeLicense(): void {
        localStorage.removeItem('licenseData')
    }

    async treatResponse(response: Response): Promise<any> {
        if (response.status === 200) {
            return await response.json()
        } else {
            const data = await response.json()

            console.log(data)
            
            if (data.errors && data.errors.length > 0) {
                Object.keys(data.errors).forEach((key) => {
                    const message = data.errors[key] ? data.errors[key][0] : null

                    if (message) {
                        Alert.error(message)
                    }
                })
            } else {
                Alert.error(data.message)
            }
        }

        return null
    }
}