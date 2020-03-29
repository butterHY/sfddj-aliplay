Page({
  data: {
    alphabet: [],
  },
  onLoad() {
    const charCode = 65;
    const charList = [];
    for (let i = 0; i < 10; i++) {
      charList.push(String.fromCharCode(charCode + i));
    }
    this.setData({
      alphabet: charList,
    });
  },
  onAlphabetClick(ev) {
    // my.alert({
    //   content: JSON.stringify(ev.data),
    // });
  },


  select(e) {
    // console.log(e)
    my.navigateTo({ url: '../addressLoc/addressLoc' });
  }
});
