import Alert from "@Renderer/components/utils/Alert"

export interface LicenseData {
    email: string
    code: string
    isLifetime: boolean
    endsAt: string
    expired: boolean
}

export default class LicenseHandler {
    async checkLicense(email:string, license: string): Promise<boolean> {
            
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

        const data = await this.treatResponse(response)

        if (data) {
            this.saveLicense(data)

            return true
        }

        return false
    }

    async revokeLicense(email:string, license: string): Promise<boolean> {
        
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

    async treatResponse(response: Response): Promise<any> {
        if (response.status === 200) {
            return await response.json()
        } else {
            const data = await response.json()
            
            if (data.errors) {
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