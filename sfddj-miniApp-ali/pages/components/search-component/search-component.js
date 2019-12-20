let app = getApp();
let sendRequest = require('../../../utils/sendRequest');
let constants = require('../../../utils/constants');
import api from '../../../api/api';
import http from '../../../api/http';

Component({
  mixins: [],
  data: {
    baseLocImgUrl: constants.UrlConstants.baseImageLocUrl,
    smartSearchList: [],                      // 智能搜索数据
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
    placeholderVal: '',                       // 输入框隐藏词。
  },
  
  didMount() {
    // this.$page.xxCom = this;  // 通过此操作可以将组件实例挂载到所属页面实例上   
    // console.log(this.is);     // 组件路径
    // console.log(this.$page);  // 组件所属页面实例
    // console.log(this.$id);    // 组件 id，可直接在组件 axml 中渲染值
    this.$page.searchComponent = this;  // 页面 onLoad 后的 onShow 获取不到，因为有时差，但之后页面的 onShow 都能获取到，而 saveRef(ref) 只在页面 onLoad 后自动触发，之后不会再触发；
    this.data.pageType = this.props.pageType;

    this.getHotWord();
  },

  didUpdate() {},
  didUnmount() {},

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
      if(that.props.pageType == 'home') {
        getApp().globalData.uma.trackEvent('homepage_searchClick'); 
      }
    },

    /**
    * 获取热词
    */
    getHotWord() {
      let that = this;
      http.get( api.search.SEARCHHOTWORD, {}, (res) => {
        let resData = res.data.data;
        let resRet = res.data.ret;
        if(resRet.code == '0' && resRet.message == "SUCCESS" && resData ) {
          that.setData({
            hotWords: resData
          });
        }
      },(err) => { })
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
      } catch (e) { }
    },

    /**
     * 键盘输入事件
     */
    handleInput(value) {
      let inputVal = value.replace(/\s*/g,'');
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
        inputVal: value
      });
    },

    /**
	 * 搜索商品
	 * type 0:刷新 1:加载更多
	 */
    smartSearch(inputVal) {
      let that = this;
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
        let resData = res.data.data;
        let retData = res.data.ret;
        // 添加 that.data.inputVal.replace(/\s*/g,'') 是为了防止，input 删除为空的时候，数据请求才回来，这时就会导致 input 为空，智能搜索模版显示，但热词模版不显示的情况；
        if( retData && retData.code == '0' && retData.message == "SUCCESS" && resData && resData.length > 0 && that.data.inputVal.replace(/\s*/g,'') ) {
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
        // placeholderVal: '',
        hotWordShow: true,
        smSearchShow: false,
        smartSearchList: [],
      });
      that.props.pageType == 'showSearchPage' ? that.props.onSelectOrEnter(word, 'noGetHistory') : that.goToSearchPage(word, type);
    },

    /**
    *  键盘回车
    */
    handleConfirm(value) {
      let that = this;
      my.hideKeyboard();
      let confirmValue = value;
      if( !value.replace(/\s*/g,'') ) {
        confirmValue = that.props.placeholderVal;
      }
      this.setData({
        inputVal: '',
        hotWordShow: true,
        smSearchShow: false,
      })
      that.props.pageType == 'showSearchPage' ? that.props.onSelectOrEnter(confirmValue, 'noGetHistory') : that.goToSearchPage(confirmValue, 'searchValue');
    },

    /**
    * 清除搜索历史
    */
    clearHist() {
      my.confirm({
        title: '',
        content: '您确定要清除历史纪录？',
        success: (res) => {
          if( res.confirm == true ) {
            this.setData({
              searchWords: [],
            })
            try {
              my.setStorageSync({ key: constants.StorageConstants.searchWordsKey, data: [] });
            } catch (e) { }
          }
        }
      })
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
