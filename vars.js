fileRead = false;
fileWritten = true;
scriptObjs = [];
chunkedTVList = [];
jobList = [];

fileName = "../data/scriptsched.json"

staticChannelList = [
    { 'channelId' : '3_2_2_1_0_0_0', 'channelMode' : 'Cable', 'channelNumber' : '2-1'}
    , { 'channelId' : '3_3_3_1_0_0_0', 'channelMode' : 'Cable', 'channelNumber' : '3-1'}
    , { 'channelId' : '3_47_47_1_0_0_0', 'channelMode' : 'Cable', 'channelNumber' : '47-1'}
    , { 'channelId' : '47-2', 'channelMode' : 'Cable', 'channelNumber' : '47-2'}
    , { 'channelId' : '47-3', 'channelMode' : 'Cable', 'channelNumber' : '47-3'}
    , { 'channelId' : '47-4', 'channelMode' : 'Cable', 'channelNumber' : '47-4'}
    , { 'channelId' : '47-5', 'channelMode' : 'Cable', 'channelNumber' : '47-5'}
    , { 'channelId' : '3_58_58_1_0_0_0', 'channelMode' : 'Cable', 'channelNumber' : '58-1'}
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
        'ipAddress': "192.168.254.21",
        'tvNumber' : "2",
        'mfg' : "SONY",
        'key' : "350"
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
        'ipAddress': "192.168.254.99",
        'tvNumber' : "6",
        'mfg' : "VIZIO",
        'key' : "xxxxxxxxx"
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