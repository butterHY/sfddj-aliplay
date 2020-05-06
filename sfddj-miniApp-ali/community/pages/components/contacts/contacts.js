Component({
  mixins: [],
  data: {
      contactsPop: false,
      contactsTel: '',
      telsList: [],     //联系电话列表
  },
  props: {},
  didMount() {
      // this.setData({
      //     contactsTel: this.props.contactsTel
      // })
      let telsList = this.handleTels(this.props.contactsTel);
      this.setData({
          telsList: Object.assign([],telsList)
      })
  },
  didUpdate() {
      // let telsList = this.handleTels(this.props.contactsTel);
      // console.log(telsList)
      // this.setData({
      //     telsList: Object.assign([],telsList)
      // })
      
  },
  didUnmount() {},
  methods: {

    handleTels(tels = ''){
      let telsList = tels.split(',');
      return telsList;
      // console.log('[[[',telsList)
    },

    tapContacts(data) {   
        // let _showPop =  'itemsBtn[' +  data.index + '].showPop';   
        this.setData({  
            contactsPop: true,
            index: data.index
        }); 
    },

    onPopupClose() {
        this.setData({
            contactsPop: false
        }); 
    },

    onCallPhone(data) {
      let {index} = data;
      let _tel = this.data.telsList[index];
      my.makePhoneCall({ number: _tel });
    } 
  },
});
