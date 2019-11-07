var constants = require('../../../utils/constants');
Component({
	mixins: [],
	data: {
		baseImageLocUrl: constants.UrlConstants.baseImageLocUrl,
		showPageType: ''
	},
	props: {},
	didMount() {
		this.setData({
			showPageType: this.props.showPageType ? this.props.showPageType : ''
		})
	},
	didUpdate() { },
	didUnmount() { },
	methods: {
		refreshPage() {
			var that = this;
			that.props.onRefreshPage(true)
		}
	},
});
