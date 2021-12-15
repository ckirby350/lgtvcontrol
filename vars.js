fileRead = false;
fileWritten = true;
scriptObjs = [];
chunkedTVList = [];
jobList = [];

fileName = "../data/scriptsched.json"

vizioChannelList = [
    { 'channelId' : '47-1', 'channelMode' : 'Cable', 'channelNumber' : '47-1'}
    , { 'channelId' : '47-2', 'channelMode' : 'Cable', 'channelNumber' : '47-2'}
    , { 'channelId' : '47-3', 'channelMode' : 'Cable', 'channelNumber' : '47-3'}
    , { 'channelId' : '58-1', 'channelMode' : 'Cable', 'channelNumber' : '58-1'}
    , { 'channelId' : '58-2', 'channelMode' : 'Cable', 'channelNumber' : '58-2'}
];

tvListObj = [
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "1",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "2",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "3",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "4",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.77",
        'tvNumber' : "5",
        'mfg' : "VIZIO",
        'key' : "Zqcxkfnf6l"
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "6",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "7",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "8",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "9",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "10",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "11",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "12",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "13",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "14",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "15",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "16",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "10.10.23.8",
        'tvNumber' : "17",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "18",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "19",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "20",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "21",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "22",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "23",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "24",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "25",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "26",
        'mfg' : "LG",
        'key' : ""
    }
];