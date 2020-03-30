Component({
  mixins: [],
  data: {
      contactsPop: false,
      contactsTel: ''
  },
  props: {},
  didMount() {
      this.setData({
          contactsTel: this.props.contactsTel
      })
  },
  didUpdate() {
      this.setData({
          contactsTel: this.props.contactsTel
      })
  },
  didUnmount() {},
  methods: {
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

    onCallPhone() {
        let _tel = this.data.contactsTel;
        my.makePhoneCall({ number: _tel });
    } 
  },
});
