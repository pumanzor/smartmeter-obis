/*jshint expr: true*/
var chai = require('chai');
var expect = chai.expect;
var mock = require('mock-require');
mock('serialport', 'virtual-serialport');

describe('test SerialRequestResponseTransport Timeout with D0Protocol', function() {

    it('check timeout', function(done) {
        this.timeout(600000); // because of first install from npm

        var SmartmeterObis = require('../index.js');

        var options = {
            'protocol': 'D0Protocol',
            'transport': 'SerialRequestResponseTransport',
            'transportSerialPort': '/dev/ir-usb1',
            'transportSerialBaudrate': 300,
            'protocolD0WakeupCharacters': 40,
            'protocolD0DeviceAddress': 'Bla0',
            'requestInterval': 10,
            'transportHttpRequestUrl': '',
            'obisNameLanguage': 'en',
            'obisFallbackMedium': 6,
            'transportSerialMessageTimeout': 10000,
            'debug': 2
        };

        var counter = 0;
        var errCounter = 0;
        function testStoreData(err, obisResult) {
            if (err) {
                expect(obisResult).to.be.null;
                errCounter++;
                console.log('ERROR: ' + err);
            }
            else {
                console.log('Received data ' + counter + ': ' + Object.keys(obisResult));
                counter++;
                for (var obisId in obisResult) {
                    console.log(obisResult[obisId].idToString() + ': ' + SmartmeterObis.ObisNames.resolveObisName(obisResult[obisId], options.obisNameLanguage).obisName + ' = ' + obisResult[obisId].valueToString());
                }
            }
            return false;
        }

        var smTransport = SmartmeterObis.init(options, testStoreData);

/*        var errorHandled = false;
        var originalException = process.listeners('uncaughtException').pop();
        if (originalException) process.removeListener('uncaughtException', originalException);
        process.once("uncaughtException", function (err) {
            console.log('CATCHED');
            if (originalException) process.listeners('uncaughtException').push(originalException);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.be.equal('No or too long answer from Serial Device after last request.');
            expect(counter).to.be.equal(0);
            setTimeout(done, 1000);
        });*/
        setTimeout(function() {
            expect(counter).to.be.equal(0);
            expect(errCounter).to.be.equal(1);
            expect(smTransport.serialConnected).to.be.false;
            expect(smTransport.serialComm).to.be.null;
            setTimeout(function() {
                expect(smTransport.serialConnected).to.be.false;
                expect(smTransport.serialComm).to.be.null;
                setTimeout(function() {
                    expect(counter).to.be.equal(0);
                    expect(errCounter).to.be.equal(1);
                    expect(smTransport.serialConnected).to.be.false;
                    expect(smTransport.serialComm).to.be.null;
                    smTransport.stop();
                    setTimeout(done, 1000);
                }, 12000);
            }, 9000);
        }, 12000);

        smTransport.process();

    });
});
