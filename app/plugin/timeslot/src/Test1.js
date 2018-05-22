class Test1 {

    constructor() {
        this.mockData = this.createMockData();

    }

    createMockString() {
        var textString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var length = Math.random() * (10 - 4) + 4;
        var mockString = '';

        for (var i = 0; i < length; i += 1) {
            var stringIndex = Math.random() * (textString.length - 0);
            mockString += textString.substring(stringIndex, stringIndex + 1);
        }

        return mockString;
    }

    createMockData(textProperty, valueProperty) {
        var data = [];

        for (var i = 0; i < 200; i += 1) {
            var mockObj = {};
            mockObj['id'] = this.createMockString();
            mockObj['name'] = this.createMockString();
            mockObj['surname'] = this.createMockString();

            data.push(mockObj);
        }

        return data;
    }

    get serviceLabel() {
        return 'Test 1';
    }

    get serviceName() {
        return Test1.name;
    }

    get serviceDescription() {
        return 'Sono una descrizione';
    }

    getServiceData(value) {
        return this.mockData.filter(function (obj) {
            return obj.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
        })
    }

    getTimeslotData(data) {
        console.log('DATAAAAAAAAAAA',data)
        return {
            id :'123',
            name:'test1',
            surname: 'test1'
        }
    }

    /**
     * @param data
     */
    extractTimeslot(data) {
        let obj = this.mockData.find(function (obj) {
            return obj.id === data.id;
        });

        if (obj) {
            return {id:obj.id}
        } else {
            return {}
        }
    }
}

module.exports = Test1;