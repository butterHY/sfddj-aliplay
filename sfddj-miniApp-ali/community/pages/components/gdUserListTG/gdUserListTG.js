import { baseImageUrl } from '/api/api';
Component({
  mixins: [],
  data: {
    baseImageUrl: baseImageUrl,
    leader: {
      userName: '数据未设定',
      memberImagePath: 'oto/shop/2/20200414/158685058891916653.jpg',
      tuangouIng: 0,
      tuangouCount: 0,
      timer: '19:34:09:56'
    },

    userList: [
      {
        userName: '数据未设定1',
        memberImagePath: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

    ],

    swiperList: [],

    swiperOpt: {
      autoplay: true,
      vertical: true,
      interval: 1000,
      circular: true,
      duration: 1500,
    },

    listShowOff: false,
    cutTimer: null,
  },

  props: {
    userListTG: 'userListTG',
    nowTime: 'nowTime'
  },

  didMount() {
    this.init();
  },
  didUpdate() {
    let cutTimer = this.data.cutTimer;
    clearTimeout(cutTimer);
    // console.log('didUpdate')
  },

  didUnmount() {
    let cutTimer = this.data.cutTimer;
    clearTimeout(cutTimer);
  },

  methods: {
    init() { 
      let userListTG = this.props.userListTG[0];
      let nowTime = this.props.nowTime;  
      let endTime = userListTG.activityEndTime;
      let timeDes = endTime - nowTime;
 
      this.setLeader(userListTG);
      this.setSwiperList(userListTG.joinMembers); 
      this.setCountDown(this, timeDes);
    },

    setLeader(list) {
      let _list = list;
      this.setData({
        'leader.tuangouCount': _list.tuangouCount,
        'leader.tuangouIng': _list.tuangouCount * 1 - _list.joinedCount * 1 - 1,
        'leader.userName': _list.joinMembers[0].userName,
        'leader.memberImagePath': _list.joinMembers[0].memberImagePath,

      }) 
    },

     
    /**
     * 倒计时
     */
    setCountDown(isCom, timeDes) {
      let _this = isCom;
      let cutTimer = _this.data.cutTimer;
      let time = 100; 
      if (timeDes <= 0) {
        clearTimeout(cutTimer);
        timeDes = 0;
      }
      let formatTime = _this.getFormat( timeDes );
      timeDes -= time;
      let countDown = `${formatTime.hh}:${formatTime.mm}:${formatTime.ss}:0${ parseInt(formatTime.ms / time) }`; 

      // console.log( parseInt(formatTime.ms/100) )
      _this.setData({
        'leader.timer': countDown
      }); 

      return
 
      clearTimeout(cutTimer);
      cutTimer = setTimeout( ()=> {
        _this.setCountDown(_this, timeDes);
      }, time);
    },

    /**
     * 格式化时间
     */
    getFormat: function (msec) {
      let ss = parseInt(msec / 1000);
      let ms = parseInt(msec % 1000);
      let mm = 0;
      let hh = 0;
      if (ss > 60) {
        mm = parseInt(ss / 60);
        ss = parseInt(ss % 60);
        if (mm > 60) {
          hh = parseInt(mm / 60);
          mm = parseInt(mm % 60);
        }
      }
      ss = ss > 9 ? ss : `0${ss}`;
      mm = mm > 9 ? mm : `0${mm}`;
      hh = hh > 9 ? hh : `0${hh}`;
      return { ms, ss, mm, hh };
    }, 

    // 这是轮播的数据 2条为一个
    setSwiperList(list) {
      const _userList = list;
      // const _userList = this.data.userList;
      let newList = [];
      let iNow = 0;
      for (let i = 0; i < _userList.length; i++) {
        if (i % 2) {
          newList[iNow].list.push(_userList[i]);
          iNow++;
        }
        else {
          newList[iNow] = {};
          newList[iNow].list = [];
          newList[iNow].list.push(_userList[i]);
        }
      }
      this.setData({
        swiperList: newList,
        userList: _userList
      });
    },

    onModalOpen() {
      this.setData({
        listShowOff: true
      })
    },

    onModalClose() {
      this.setData({
        listShowOff: false
      })
    }
  },
});