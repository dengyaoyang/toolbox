<template>
  <div>
    <div id="stringsCss">
      <el-row :gutter="20">
        <el-col :span="14"> <el-input v-model="strings"></el-input> </el-col>
        <el-col :span="6">  <el-button>提交</el-button> </el-col>
      </el-row>
      </div>
  </div>
</template>

<script>

export default {
  name: "index",
  data:function (){
    return {
       strings: ''
    }
  }
}
</script>

<style scoped>
#stringsCss {
  padding-left: 50px;
  padding-right: 150px;
  padding-top: 30px;
}
</style>
