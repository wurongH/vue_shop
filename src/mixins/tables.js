//获取数据方法名: getList

export default {
  data () {
    return {
      //总页数
      total: 0,
      //表格数据
      tableData: [],
      
      queryInfo: {
        query: '',
        //当前页
        pagenum: 1,
        //每页
        pagesize: 5
      },
    }
  },
  computed: {
  },
  methods: {

    //选择每页显示条数触发
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getList();
    },
    //点击页码触发
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getList();
    },


  }
}