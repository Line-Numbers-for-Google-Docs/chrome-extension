export class Metrics {
    static sendMetricsTagData(data) {
        chrome.runtime.sendMessage({metricsTagData: data}, function(response) {});
    }

    static documentLoaded(numberingEnabled) {
        const data = {
            event: 'documentLoaded',
            virtualPath: '/document',
            virtualTitle: 'GDocs Document',
            numberingEnabled: numberingEnabled,
        };

        this.sendMetricsTagData(data);
    }

    static numberingEnabled() {
        const data = {
            event: 'numberingEnabled',
            virtualPath: '/document',
            virtualTitle: 'GDocs Document',
        };
    }

    static NumberingDisabled() {
        const data = {
            event: 'numberingDisabled',
            virtualPath: '/document',
            virtualTitle: 'GDocs Document',
        };
    }
}