//自适应设置浏览屏幕高度
export default {
  data () {
    return {
      documentHeight: '',
    }
  },
  watch: {

  },
  created() {
    this.getHight()
    //监听浏览器窗口变化
    window.addEventListener('resize', this.getHight);
  },
  destroyed() {
    window.removeEventListener('resize', this.getHight)
  },
  methods: {
    //浏览窗口的高度
    getHight(){
      this.documentHeight = window.innerHeight - 230 + 'px'
    }
  }
}