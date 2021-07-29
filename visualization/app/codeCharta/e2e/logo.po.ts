export class LogoPageObject {
	async getVersion() {
		await page.waitForSelector("#logo > .code-charta-logo .version")
		const versionString = await page.$eval("#logo > .code-charta-logo .version", element => element["innerText"])
		return versionString.split(" ")[1]
	}

	async getLink() {
		await page.waitForSelector("#logo > a")
		return page.$eval("#logo > a", element => element["href"])
	}

	async getImageSrc() {
		await page.waitForSelector("#logo > a > img")
		return page.$eval("#logo > a > img", element => element["src"])
	}
}
