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
        try {
            const response = await fetch('http://localhost:8000/v2/licenses/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    license
                })
            })

            if (response.status === 200) {
                const data = await response.json()
                this.saveLicense(data)
                return true
            } else {
                const data = await response.json()
                if (data.errors) {
                    data.errors.forEach((error: string) => {
                        Alert.error(error)
                    })
                } else {
                    Alert.error(data.message)
                }
            }
        }
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
}