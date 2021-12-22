<template>
  <div id="wrapper">
    <img id="logo" :src="logo" alt="electron-vue" />
    <div v-for="(item,index) in que" :key="index">
        <el-button type="text" @click="paste(item)">{{item}}</el-button>
    </div>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import { message,copyMsg } from "@/api/login";
import { ipcRenderer,shell } from "electron";
import { clipboard } from "electron"

export default {
  name: "landing-page",
  components: { SystemInformation },
  data: () => ({
    newdata: {
      name: "yyy",
      age: "12",
    },
    logo: require("@/assets/logo.png"),
    textarray: [],
    percentage: 0,
    colors: [
      { color: "#f56c6c", percentage: 20 },
      { color: "#e6a23c", percentage: 40 },
      { color: "#6f7ad3", percentage: 60 },
      { color: "#1989fa", percentage: 80 },
      { color: "#5cb87a", percentage: 100 },
    ],
    dialogVisible: false,
    progressStaus: null,
    filePath: "",
    que: []
  }),
  mounted() {
    this.timer =  setInterval(()=>{
      let resultQue =  copyMsg();
      resultQue.then((msg)=>{
        this.que = msg.data
      })
    },3000)
    ipcRenderer.on('getCopyText',()=>{
      console.log("123123")
    })
  },
  created() {

    console.log("环境打印示例")
    console.log(__lib);
    console.log(process.env.TERGET_ENV)
    console.log(process.env)
    ipcRenderer.on("download-progress", (event, arg) => {
      this.percentage = Number(arg);
    });
    ipcRenderer.on("download-error", (event, arg) => {
      if (arg) {
        this.progressStaus = "exception";
        this.percentage = 40;
        this.colors = "#d81e06";
      }
    });
    ipcRenderer.on("download-paused", (event, arg) => {
      if (arg) {
        this.progressStaus = "warning";
        this.$alert("下载由于未知原因被中断！", "提示", {
          confirmButtonText: "重试",
          callback: (action) => {
            ipcRenderer.invoke("satrt-download");
          },
        });
      }
    });
    ipcRenderer.on("download-done", (event, age) => {
      this.filePath = age.filePath;
      this.progressStaus = "success";
      console.log("下载完成啦")
      this.$alert("更新下载完成！", "提示", {
        confirmButtonText: "确定",
        callback: (action) => {
          shell.openPath(this.filePath);
        },
      });
    });
    ipcRenderer.on("UpdateMsg", (event, age) => {
      switch (age.state) {
        case -1:
          const msgdata = {
            title: "发生错误",
            message: age.msg,
          };
          this.dialogVisible = false;
          ipcRenderer.invoke("open-errorbox", msgdata);
          break;
        case 0:
          this.$message("正在检查更新");
          break;
        case 1:
          this.$message({
            type: "success",
            message: "已检查到新版本，开始下载",
          });
          this.dialogVisible = true;
          break;
        case 2:
          this.$message({ type: "success", message: "无新版本" });
          break;
        case 3:
          this.percentage = age.msg.percent.toFixed(1);
          break;
        case 4:
          this.progressStaus = "success";
          this.$alert("更新下载完成！", "提示", {
            confirmButtonText: "确定",
            callback: (action) => {
              ipcRenderer.invoke("confirm-update");
            },
          });
          break;

        default:
          break;
      }
    });
  },
  methods: {
    paste(e){
      console.log(`paste${e}`)
      clipboard.writeText(e)
    },
    openNewWin() {
      let data = {
        url: "/form/index",
      };
      ipcRenderer.invoke("open-win", data);
    },
    openDocument() {
      let data = {
        url: "/brower/index",
        webview:true,
        resizable:true,
        width:600,
        height:700
      };
      ipcRenderer.invoke("open-win", data);
    },
    getMessage() {
      message().then((res) => {
        this.$alert(res.data, "提示", {
          confirmButtonText: "确定",
        });
      });
    },
    StopServer() {
      ipcRenderer.invoke("stop-server").then((res) => {
        this.$message({
          type: "success",
          message: "已关闭",
        });
      });
    },
    StartServer() {
      ipcRenderer.invoke("statr-server").then((res) => {
        if (res) {
          this.$message({
            type: "success",
            message: res,
          });
        }
      });
    },
    // 获取electron方法
    open() {},
    CheckUpdate(data) {
      switch (data) {
        case "one":
          ipcRenderer.invoke("check-update").then((res) => {
            console.log("启动检查");
          });

          break;
        case "two":
          ipcRenderer.invoke("start-download").then(() => {
            this.dialogVisible = true;
          });

          break;

        default:
          break;
      }
    },
    handleClose() {
      this.dialogVisible = false;
    },
    changeLanguage() {
      let lang = this.$i18n.locale === 'zh-CN' ? 'en' : 'zh-CN'
      this.$i18n.locale = lang
    }
  },
  destroyed() {
    console.log("销毁了哦");
    ipcRenderer.removeAllListeners("confirm-message");
    ipcRenderer.removeAllListeners("download-done");
    ipcRenderer.removeAllListeners("download-paused");
    ipcRenderer.removeAllListeners("confirm-stop");
    ipcRenderer.removeAllListeners("confirm-start");
    ipcRenderer.removeAllListeners("confirm-download");
    ipcRenderer.removeAllListeners("download-progress");
    ipcRenderer.removeAllListeners("download-error");
    clearInterval(this.timer)
    this.timer = null
  },
  computed: {
    text() {
      return this.$i18n.t("waitDataLoading")
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  padding: 60px 80px;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main > div {
  flex-basis: 50%;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}
.doc {
  margin-bottom: 10px;
}
.doc p {
  color: black;
  margin-bottom: 10px;
}
.doc .el-button {
  margin-top: 10px;
  margin-right: 10px;
}
.doc .el-button + .el-button {
  margin-left: 0;
}
.conten {
  text-align: center;
}
</style>
