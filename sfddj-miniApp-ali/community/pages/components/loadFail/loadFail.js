import {staticsImageUrl} from '/api/api';
Component({
	mixins: [],
	data: {
		baseImageLocUrl: staticsImageUrl,
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
