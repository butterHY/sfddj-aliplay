import api from '/api/api';

Component({
    mixins: [],
    data: {
        staticsImageUrl: api.staticsImageUrl,
        baseImageUrl: api.baseImageUrl,
        // goodsList: [],
        // shopName: '',
        // typeIndex: 0,
        // shopTotalPrice: 0,
        // totalPrice: 0,
        // type: '',
        // result: {},
    },
    props: {
        isTuangou: false,
        goodsList: [],
        shopName: '',
        typeIndex: 0,
        shopTotalPrice: 0,
        totalPrice: 0,
        type: '',
        result: {},
    },
    didMount() {
        // this.setData({
        //     goodsList: this.props.goodsList,
        //     shopName: this.props.shopName,
        //     typeIndex: this.props.typeIndex,
        //     shopTotalPrice: this.props.shopTotalPrice,
        //     totalPrice: this.props.totalPrice,
        //     type: this.props.type,
        //     result: this.props.result
        // })
    },
    didUpdate() {
        // this.setData({
        //     goodsList: this.props.goodsList,
        //     shopName: this.props.shopName,
        //     typeIndex: this.props.typeIndex,
        //     shopTotalPrice: this.props.shopTotalPrice,
        //     totalPrice: this.props.totalPrice,
        //     result: this.props.result
        // })
    },
    didUnmount() { },
    methods: {

        // 去商品详情页
        toGoodsDetail(e) {
            let { goodsId } = e.currentTarget.dataset;
            my.navigateTo({
                url: '/community/pages/goodsDetail/goodsDetail?goodsId=' + goodsId
            });
        },
    },
});
