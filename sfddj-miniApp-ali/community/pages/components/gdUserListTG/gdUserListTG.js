import {baseImageUrl} from '/api/api';
Component({
  mixins: [],
  data: {
    baseImageUrl: baseImageUrl,
    storeShow: {
      shopName: '数据未设定',
      address: '彩讯科创199',
      id: 2,
      shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
    },

    userList: [
      {
        shopName: '数据未设定1',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

      {
        shopName: '数据未设定2',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

      {
        shopName: '数据未设定3',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

      {
        shopName: '数据未设定4',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

      {
        shopName: '数据未设定5',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      }, 

      {
        shopName: '数据未设定6',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

      {
        shopName: '数据未设定7',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

      {
        shopName: '数据未设定8',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

      {
        shopName: '数据未设定9',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      },

      {
        shopName: '数据未设定10',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
      }, 

      {
        shopName: '数据未设定11',
        address: '彩讯科创199',
        id: 2,
        shopLogo: 'oto/shop/2/20200414/158685058891916653.jpg',
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
  },
  props: {},
  didMount() {
    this.setSwiperList();
  },
  didUpdate() {},
  didUnmount() {},
  methods: {  
    // 这是轮播的数据 2条为一个
    setSwiperList() {
      const _userList = this.data.userList;
      let newList = [];
      let iNow = 0;
      for(let i=0; i<_userList.length; i++) {
        if( i%2 ) {
          newList[iNow].list.push( _userList[i] );
          iNow++; 
        }
        else {
          newList[iNow] = {};
          newList[iNow].list = [];
          newList[iNow].list.push( _userList[i] );
        } 
      }
      this.setData({
        swiperList: newList
      })
      // console.log('newList',newList)
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
