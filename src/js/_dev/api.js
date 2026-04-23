export const api = {
    http: async (method, url, data = null) => {
        console.log(`HTTP ${method.toUpperCase()} request to ${url} with data:`, data);

        if(url.startsWith('/mapsync/sync/') && method.toLowerCase() === 'get') {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

            return { data: {} };
        }

        if(url === '/mapsync/entity-types' && method.toLowerCase() === 'get') {
            return {
                data: {
                    entityTypes: [
                        {
                            id: '1', name: 'Vessel', attributes: [
                                { id: 1, datatype: 'string', label: 'Name' },
                                { id: 2, datatype: 'wkt', label: 'Find Location' }
                            ]
                        },
                        {
                            id: '2', name: 'Mill', attributes: [
                                { id: 3, datatype: 'string', label: 'Name' },
                                { id: 4, datatype: 'wkt', label: 'Location' }
                            ]
                        },
                        {
                            id: '3', name: 'Well', attributes: [
                                { id: 5, datatype: 'string', label: 'Name' },
                                { id: 6, datatype: 'wkt', label: 'Location' }
                            ]
                        },
                    ]
                }
            };
        }


        throw new Error(`HTTP method ${method} to ${url} with data ${JSON.stringify(data)} is not implemented in the plugin polyfill.`);
    }

};