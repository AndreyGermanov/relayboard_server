export default  {
    port: '/dev/ttyUSB0',
    baudrate: 9600,
    pins: [
        {
            number: 6,
            title: 'Movement sensor',
            type: 'sensor'
        },
        {
            number: 7,
            title: 'Lamp',
            type: 'relay'
        }
    ]
}