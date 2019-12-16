let app = getApp();
let sendRequest = require('../../../utils/sendRequest');
let constants = require('../../../utils/constants');
import api from '../../../api/api';
import http from '../../../api/http';

Component({
  mixins: [],
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    smartSearchList: [],
    inputVal: '',                             // 搜索值
    searchWords: [],                          // 搜索记录数据
    hotWords: [],                             // 搜索热词数据
    hotWordShow: true,                        // 搜索热词显示开关
    smSearchShow: false,                      // 智能板块显示开关
    clearSearchShow: false,                    // 清除搜索词开关
  },
  props: {
    pageType: null,                           // 从哪个页面进入的
    isFocus: false,                           // 是否获取焦点
    onShowSearch: (data) => console.log(data),
    placeholderVal: '',                       // 输入框隐藏词
  },
  
  didMount() {
    // this.$page.xxCom = this;  // 通过此操作可以将组件实例挂载到所属页面实例上   
    // console.log(this.is);     // 组件路径
    // console.log(this.$page);  // 组件所属页面实例
    // console.log(this.$id);    // 组件 id，可直接在组件 axml 中渲染值
    console.log('我挂载上去了')
    this.$page.searchComponent = this;  // 页面 onLoad 后的 onShow 获取不到，因为有时差，但之后页面的 onShow 都能获取到，而 saveRef(ref) 只在页面 onLoad 后自动触发，之后不会再触发；
    this.data.pageType = this.props.pageType;
    console.log(this.props.placeholderVal);
    console.log(this.data.pageType)

    this.getHotWord();
  },

  didUpdate() {},
  didUnmount() {
    console.log('我卸载了')
  },
  methods: {
  /**
    * 搜索组件开关
  */
    onHideSearch() {
      this.props.onShowSearch('noGetHistory');
      //  this.props.onShowSearch();
      this.setData({
        inputVal: '',
        hotWordShow: true,
        smSearchShow: false,
      })
    },

    /**
    * 获取焦点 友盟+统计--（首页需要）
    */
    handleFocus(event) {
      let that = this;
      console.log(that.props.pageType);
      if(that.props.pageType == 'home') {
        getApp().globalData.uma.trackEvent('homepage_searchClick'); 
      }
    },

    /**
    * 获取热词
    */
    getHotWord() {
      let that = this;
      console.log('获取热词');
      sendRequest.send(constants.InterfaceUrl.HOT_WORD, {}, function(res) {
        that.setData({
          hotWords: res.data.result
        });
      }, function(err) {
      }, 'GET');
      that.getHistory();
    },

    /**
    * 获取历史记录
    */
    getHistory() {
      let that = this;
      try {
        var searchWords = my.getStorageSync({
          key: constants.StorageConstants.searchWordsKey, // 缓存数据的key
        }).data;
        that.setData({
          searchWords: searchWords && searchWords.length > 0 ? searchWords.reverse() : [],
        });
        console.log('获取历史记录+++++++++++++++', searchWords);
      } catch (e) { }
    },

    /**
     * 键盘输入事件
     */
    handleInput(event) {
      console.log(event.detail.value.replace(/\s*/g,''))
      let inputVal = event.detail.value.replace(/\s*/g,'');
      let hotWordShow = true;
      let smSearchShow = true;
      let clearSearchShow = false;
      // inputVal != this.data.inputVal
      if( inputVal ) {
        this.smartSearch(inputVal);
        hotWordShow = false;
        clearSearchShow = true;
      } else {
        smSearchShow = false;
      }
      this.setData({
        clearSearchShow,
        hotWordShow,
        smSearchShow,
        inputVal: event.detail.value
      });
    },

    /**
	 * 搜索商品
	 * type 0:刷新 1:加载更多
	 */
    smartSearch(inputVal) {
      let that = this;
      console.log(inputVal);
      my.showLoading({
        content: '加载中...',
        delay: '2000',
      });
      let data = {
        suggestStr: inputVal,
        showChannel: 0
      }
      let retunData = {
        hotWordShow: true,
        smSearchShow: false,
        smartSearchList: []
      };
      http.post( api.search.GOODSSUGGEST, data ,(res) => {
        console.log(res);
        let resData = res.data.data;
        let retData = res.data.ret;
        if( retData && retData.code == '0' && retData.message == "SUCCESS" && resData && resData.length > 0 ) {
          retunData.hotWordShow = false;
          retunData.smSearchShow = true;
          retunData.smartSearchList = resData;
          that.setData(retunData);
        } else {
          that.setData(retunData);
        }
        my.hideLoading();
      }, (err) => {
        that.setData(retunData);
        my.hideLoading();
        console.log(err)
      })
    },

    	/**
     * 选择搜索热词 或者 选择智能搜索词
     */
    chooseWord(event) {
      let that = this;
      let { type, word } = event.currentTarget.dataset
      this.setData({
        inputVal: '',
        placeholderVal: '',
        hotWordShow: true,
        smartSearchList: false,
      });
      console.log('选中词请求数据 inputVal',this.data.inputVal,'placeholderVal',this.data.placeholderVal)
      console.log(that.props)
      that.props.pageType == 'showSearchPage' ? that.props.onSelectOrEnter(word, 'noGetHistory') : that.goToSearchPage(word, type);
    },

    /**
    *  键盘回车
    */
    handleConfirm(event) {
      let that = this;
      console.log(event)
      let { value } = event.detail;
      console.log(value)
      this.setData({
        inputVal: '',
        hotWordShow: true,
        smSearchShow: false,
      })
      console.log('键盘回车请求数据 inputVal',this.data.inputVal,'placeholderVal',this.data.placeholderVal)
      console.log(that.props)
      that.props.pageType == 'showSearchPage' ? that.props.onSelectOrEnter(value, 'noGetHistory') : that.goToSearchPage(value, 'searchValue');
    },

    /**
    * 清除搜索历史
    */
    clearHist() {
      console.log('珊瑚虫')
      this.setData({
        searchWords: [],
      })
      try {
        my.setStorageSync({ key: constants.StorageConstants.searchWordsKey, data: [] });
      } catch (e) { }
    },

    /**
    *  清除搜索词
    */
    clearSearchVal() {
      this.setData({
        inputVal: '',
        hotWordShow: true,
        smSearchShow: false,
        clearSearchShow: false,
      })
    },

    /**
    *  搜索模块，敲击键盘完成去到搜索页（首页需要添加 友盟统计）
    */
    goToSearchPage(keyWord, type) {
      let that = this;
      if ( keyWord && keyWord.replace(/\s*/g,'') ) {
        // 达观数据上报
        // utils.uploadClickData_da('search', [{ keyword: keyWord }])
        // 友盟+ 统计  输入框输入探索
        that.props.pageType == 'home' ? that.umaTrackEvent(type, keyWord) : '';

        my.navigateTo({
          url: '/pages/home/searchResult/searchResult?keyWord=' + keyWord
        });
      }
    },

    /**
     * 友盟+ 统计 --搜索(首页统计)
    */
    umaTrackEvent(type, keyWord) {
      var keyWord = keyWord;
      console.log(type);
      if (type == 'searcHotWord') {
        // 友盟+统计--首页搜索热词点击
        getApp().globalData.uma.trackEvent('homepage_searchHotWord', { keyWord: keyWord });
      }
      else if (type == 'searchHist') {
        // 友盟+统计--首页搜索历史点击
        getApp().globalData.uma.trackEvent('homepage_searchHist', { keyWord: keyWord });
      }
      else if (type == 'searchValue') {
        // 友盟+统计--首页搜索输入
        getApp().globalData.uma.trackEvent('homepage_searchValue', { keyWord: keyWord });
      }
    },



  }
});
