const Lang = {
	HOME: {
		New: {
			Title: '最新'
		},
		Hot: {
			Title: '热门'
		},
		Video: {
			Title: '小视频',
			Free: {
				Title: '免费',
				More: '更多'
			},
			Exciting: {
				Title: '令人兴奋',
			}
		},
		FreeVideo: {
			Title: '免费视频'
		},
		VideoType: [{
			Id: 1,
			Title: '舞蹈'
		}, {
			Id: 2,
			Title: '唱歌'
		}, {
			Id: 3,
			Title: '情感'
		}, {
			Id: 4,
			Title: '艺术'
		}],
		Madal: {
			NotCoins: {
				Title: '没有足够的金币',
				Text: '她期待着你的真爱',
				ButtonsText: '立即购买'
			},
			DataIncomplete: {
				Title: '数据不完整',
				Text: '确认你是否已满<span class="color-danger">18</span>岁,然后去完善用户信息',
				ButtonsText: 'GO'
			},
			NewDay: {
				Text: '新的一天, 向大家问好!<br/><span class="color-primary">录制新的预览视频(5s)</span>'
			},
			Online: {
				Title: '如果你喜欢她,请勇敢地与她取得联系',
				Buttons_Maybe: '也许以后',
				Buttons_Call: '呼叫',
			},
			NotOnline: {
				Title: '也许TA现在很忙,你可以给她留言',
				Buttons_Maybe: '也许以后',
				Buttons_Details: '详情信息',
			}
		}
	},
	LIVE_RECORD: {
		UploadTitle: '视频正在上传...',
		Photo: {
			Title: '剪辑',
			Madal: {
				Take: '拍照',
				Select: '从相册中选择'
			},
			Buttons: '确认'
		},
		Prompt: {
			Checked: '视频将被审核,<br/> 只有高质量的视频才能赚钱',
			Length: '视频长度至少为一分钟',
			Not_Description: '请输入您的视频说明'
		},
		EditVideoInfo: {
			Title: '发布',
			Text: '视频介绍......',
			Placeholder: '视频标题或说明',
			AddTag: '添加标签',
			Buttons: {
				Release: '发布',
				SaveLocal: '保存本地'
			}
		},
		Madal: {
			DeleteVideo: {
				Text: '你确定要删除录制的视频吗?'
			},
			ExitRecord: {
				Text: '录制的视频文件将在退出后丢失?'
			}
		}
	},
	FAVORITE: {
		You_May_Also_Like: '你可能也喜欢',
		Another_Batch: '换一批',
		Follow: '关注 +',
		Followed: '已关注',
		Other_Details: {
			Information: '信息',
			Video: '视频'
		}
	},
	MESSAGE: {
		Like: {
			Title: '喜欢',
			Text: '喜欢你的视频!'
		},
		Comment: {
			Title: '评论'
		},
		Gift: {
			Title: '礼物',
			Text: '给你一个礼物,相应的积分已添加到你的帐户中。'
		},
		Prompt: {
			Pay: '每发送一条消息需要1金币',
			Free: '每天免费发送10条消息'
		},
		Anonymous: '匿名',
		System_Message: '系统消息',
		System_Default: '欢迎光临现场,我们将为您提供最好的视频和直播服务,我们希望您能在这里获得乐趣。',
		Customer_Service: '客服消息',
		Customer_Default: '嗨,我是你的助手。如果您有任何疑问,请告诉我。',
		Details: '细节',
		Delete: '删除'
	},
	USER: {
		Detail: '详细信息',
		Lists: {
			My_Video: '我的小视频',
			Watch_History: '观看历史记录',
			Chatting_Price: '聊天价格',
			Account: '账户',
			Score: '积分',
			Live_Certification: '直播认证',
			Invite: '邀请',
			Blacklist: '黑名单',
			Setting: '设置'
		}
	},
	USER_VIDEO: {
		Title: '你的剪辑视频',
		Add_Title: '添加',
		Add_Text: '(赚钱)'
	},
	USER_WATCH: {
		Title: '观看历史'
	},
	USER_PRICE: {
		Title: '聊天价格',
		Current_Price: '当前价格:',
		Certified: '星级越高,价格越贵',
		Non_Certified: '未认证',
		Button: 'GO',
		Certified_Remarks: {
			Title: '如何提高星级评分',
			Content: [{
				Title: "聊天时间",
				Text: "每天，聊天的时间必须超过两个小时"
			}, {
				Title: "积分",
				Text: "分数代表用户对您的认可"
			}, {
				Title: "评价",
				Text: "这非常重要，五星级奖项将占据你演出的重要部分"
			}]
		},
		Non_Certified_Remarks: {
			Title: '认证信息不完整',
			Content: [
				'你必须完善你的认证信息;',
				'认证完成后,你可以通过聊天来赚钱'
			]
		}
	},
	USER_ACCOUNT: {
		Title: '帐户',
		Buttons: '确认',
		Remarks_Content: '阅读并同意',
		Remarks_Text: '服务条款'
	},
	USER_SCORE: {
		Title: '积分统计',
		Total: '总计',
		Live: '直播',
		Video: '视频',
		Secondary_Title: '兑换现金',
		Insufficient_points: '积分不足',
		Score: '积分',
		Withdraw: {
			Title: '提现',
			Paypal: {
				Title: 'Paypal',
				Text: '绑定你的Papal帐户'
			},
			Visa: {
				Title: 'Visa',
				Text: '绑定你的Visa帐户'
			}
		},
		Very_Sorry: {
			Title: '非常抱歉',
			Text: '你的提现消息没有审核通过'
		},
		Under_Review: {
			Title: '正在审核中',
			Text: '我们将在一个工作日内公布结果'
		}
	},
	USER_INVITE: {
		Title: '邀请'
	},
	USER_BLACKLIST: {
		Title: '黑名单'
	},
	USER_SETTING: {
		Title: '设置',
		Account_Security: '帐户安全',
		Message_Notification: {
			Title: '消息通知',
			Text: '打开后,只能第一次收到短信或视频邀请。请在设置-通知功能中打开它以确保正常功能。',
			Buttons: {
				Open: 'Open',
				Not_Open: 'Not open'
			}
		},
		Message_Sound: '消息铃声',
		Message_Shock: '消息震动',
		Help: '帮助',
		Suggestion: '建议',
		About_Me: '关于我',
		Quit: '退出'
	},
	USER_SETTING_SECURITY: {
		Title: '帐户安全',
		Text: '手机号码已注册'
	},
	USER_SETTING_HELP: {
		Title: '帮助',
		Content: [{
			Title: "手机注册安全",
			Text: [
				"手机可以随时用来找回密码,以确保帐户安全。"
			]
		}, {
			Title: "如何获得相机权限",
			Text: [
				"第一次使用相机时,如果您需要打开许可,系统会提醒您。如果没有打开,您可以在手机中找到:",
				"设置---应用---应用名称---权限---打开相机,麦克风等"
			]
		},
		// {
		// 	Title: "如何成为一个主播",
		// 	Text: [
		// 		"你必须改善现场信息,上传漂亮的照片或上传迷人的视频,这样你才能立即成为主播。"
		// 	]
		// }, {
		// 	Title: "主播如何获得更多邀请",
		// 	Text: [
		// 		"1) 每天更新实时信息的视频,新面孔出现在用户面前",
		// 		"2）更多在线时间",
		// 		"3) 更高的评级"
		// 	]
		// },
		{
			Title: "短视频的用途是什么。",
			Text: [
				"1) 观看短视频的用户将为您带来好处。",
				"2) 短视频让用户更好地了解你并为你提供被邀请的机会。"
			]
		}, {
			Title: "我如何获得好处?",
			Text: [
				"用户需要支付金币才能观看您的视频。这些硬币将转换为分数并输入您的帐户。最后,您可以取款."
			]
		}]
	},
	USER_SETTING_SUGGESTION: {
		Title: '建议'
	},
	USER_SETTING_ABOUT: {
		Title: '关于我',
		Version: '版本:',
		Company: '公司:',
		Address: '地址:'
	},
	LOGIN: {
		Title: '您好',
		Text: '总能找到你想要的',
		Buttons: {
			Login: '登录',
			Forget_password: '忘记密码?',
			Register: '注册'
		},
		Madal: {
			Cancel: '取消操作',
			Failure: '登录失败',
			Success: '登录成功',
			Error: '区域错误'
		},
		Third_party: {
			Title: '第三方',
			Text: '即将推出',
			Mobile: 'Mobile',
			Facebook: 'Facebook',
			Snapchat: 'Snapchat',
			Twitter: 'Twitter',
			Tumblr: 'Tumblr'
		},
		Find_Password: {
			Title: '忘记密码',
			Buttons: {
				Next: '下一步',
				Confirm: '确定'
			}
		},
		Set_Password: {
			Title: '设置密码'
		}
	},
	REGISTER: {
		Title: '注册',
		Buttons: {
			Title: '确认注册'
		},
		Terms: {
			Text: '注册表示您同意',
			Title: '服务条款'
		}
	},
	PERSONAL_DETAIL: {

		Why_Make_Friends: {
			Title: '为什么交友',
			Madal: {
				Title: '为什么交友',
				Lists: ['为了兴奋起来', '为了不再孤单', '为了一个夜晚']
			}
		}
	},
	PERSONAL_DETAIL: {
		Title: '个人资料',
		Profile_photo: {
			Title: '头像照片'
		},
		Username: {
			Title: '用户名',
			Madal: {
				Title: '修改用户名',
				Placeholder: '填写一个新的用户名'
			}
		},
		Gender: {
			Title: '性别',
			Madal: {
				Male: '男',
				Female: '女'
			}
		},
		Age: {
			Title: '年龄',
			Unit: '岁',
			Madal: {
				Title: '修改生日',
			}
		},
		Height: {
			Title: '身高',
			Unit: 'cm',
			Madal: {
				Title: '修改身高',
				Placeholder: '填写新的身高(cm)'
			}
		},
		Body_Weight: {
			Title: '体重',
			Shorthand: '重量',
			Unit: 'kg',
			Madal: {
				Title: '修改体重',
				Placeholder: '填写新的体重(kg)'
			}
		},
		Interest: {
			Title: '兴趣',
			Madal: {
				Title: '兴趣',
				Text: '最多可以选择%S个项目'
			}
		},
		Your_Type: {
			Title: '你的个性',
			Shorthand: '个性',
			Madal: {
				Title: '你的个性',
				Text: '最多可以选择%S个项目'
			}
		},
		Love: {
			Title: '喜欢的类型',
			Madal: {
				Title: '你最喜欢的类型',
				Text: '最多可以选择%S个项目'
			}
		},
		Why_Make_Friends: {
			Title: '为什么交友',
			Shorthand: '目的',
			Madal: {
				Title: '为什么交友',
				Lists: [{
					text: '长时间接触,不再孤单'
				}, {
					text: '为了一夜情'
				}, {
					text: '无论如何,让我感到兴奋。'
				}, {
					text: '让自己每天快乐'
				}, {
					text: '寻找朋友'
				}, {
					text: '生理学的需要'
				}, {
					text: '其他目的'
				}]
			}
		}
	},
	LIVE_INFORMATION: {
		Title: '实时信息',
		Progress: {
			First: '上传信息',
			Second: '回顾'
		},
		Upload_Video: '上传视频',
		Upload_Photos: '上传照片',
		Remarks: [
			'该视频将向其他人展示以获得更多邀请。',
			'照片将展示你的美丽。即使你每天都可以改变它,',
			'您可以随时更改您的信息,但可能需要一段时间'
		],
		Under_Review: {
			Title: '正在审核中',
			Text: '我们将在一个工作日内公布结果'
		},
		Audit_Failure: {
			Title: '非常抱歉',
			Text: '你没有通过验证',
			Remarks: {
				Title: '失败的原因',
				Text: '图片或视频涉及政治,宗教等等'
			}
		},
		Upload_Pass: {
			Title: '向对方展示你最好的一面',
		},
		Btn_Submit: '提交',
		Btn_Modify: '修改',
		Btn_Auth: '重新认证'
	},
	LIVE_PREVIEW: {
		Actions: {
			Account: '帐号:',
			Coins: '金币',
			ShareTo: '分享',
			Comment: '评论',
			Gift: '礼物',
			Recharge: '充值',
			Send: '发送'
		},
		Comment_Prompt: {
			Is_Empty: '文字不能为空',
			Only_Once: '同一个用户只能评论一次'
		},
		Share: {
			Facebook: 'Facebook',
			Twitter: 'Twitter',
			Tumblr: 'Tumblr',
			Prompt: {
				Completed: '发布完成。',
				Error: '发布时出错。'
			}
		},
		Recharge: {
			Select_Amount: '选择金额',
			Payment_Method: '付款方式',
			PayPal: 'PayPal',
			Credit_Card: '信用卡',
			Buttons: '确认'
		},
		Called_Caller: {
			Title: '呼叫中...',
			Buttons_Cancel: '取消',
			Buttons_Refuse: '拒绝',
			Buttons_Accept: '接受'
		},
		Refuse_Call: {
			Title: '她很忙,你可以看到其他的主播',
			Buttons_Call_Again: '再来一次',
			Buttons_Maybe: 'Myabe Later'
		},
		End_Live_User: {
			Title: '评价',
			Text: '你对我满意吗',
			Chat_Length: '聊天长度:',
			Min: '分钟',
			Buttons_Submit: '提交',
			Buttons_Maybe: 'Myabe Later'
		},
		End_Live_Anchor: {
			Title: '直播信息',
			Live_Time_Today: '今天直播时间:',
			Min: '分钟',
			Chat_Length: '聊天长度',
			Increase_Score: '增加积分',
			Text: '此次直播收到的礼物',
			Buttons_Yes: '休息一下',
			Buttons_Live_Again: '再来一次'
		},
		Madal: {
			Online: {
				Title: '如果你喜欢她,请勇敢地与她取得联系',
				Buttons_Maybe: 'Maybe later',
				Buttons_Call: '来电'
			},
			NotOnline: {
				Title: '也许TA很忙，你可以给TA留言',
				Buttons_Maybe: 'Maybe later',
				Buttons_Details: '详细信息'
			},
			QuitLive: {
				Text: '你确定要退出吗?'
			},
			InsufficientAmount: {
				Title: '金币不足',
				Text: '你的金币已不足,将在<span>1分钟后</span>退出,请及时充值'
			},
			SendSuccess: {
				Text: '发送成功'
			}
		}
	},
	BAR: {
		Home: '首页',
		Favorite: '朋友',
		Message: '消息',
		Me: '我的',
		History: '历史',
		Lives_Btn: {
			Live: '直播',
			Video: '视频'
		}
	},
	OTHER_DETAILS: {
		Private_Letter: '私信',
		Video_Chat: '视频聊天'
	},
	PUBLIC: {
		Billing: '金币',
		Review: '评论',
		Refuse: '拒绝',
		Free: '免费',
		Heat: 'heat',
		Country: '国家',
		No_More: '没有了〜',
		Terms_Of_Service: '服务条款',
		Status: {
			Busy: '繁忙',
			Waiting: '等待'
		},
		Froms: {
			Country: {
				Title: '国家'
			},
			Telephone: {
				Placeholder: '密码',
				Text: '8-12 位',
				Verification: '发送'
			},
			Verification: {
				Title: '验证',
				Placeholder: '4-6 位'
			},
			Password: {
				Title: '密码',
				Placeholder: '8-12 位'
			},
			Paypal_Account: {
				Title: 'Paypal帐户',
				Placeholder: '姓名或电子邮件'
			},
			Expiration_Data: {
				Title: '到期时间'
			},
			Card_Number: {
				Title: '卡号',
				Placeholder: '请输入卡号'
			},
			CSC: {
				Title: 'CSC',
				Placeholder: '安全码'
			}
		},
		Buttons: {
			Save: '保存',
			Modify: '修改'
		},
		ModalTitle: '提示',
		modalAlertButton: '我知道了',
		ModalButtonOk: '是',
		ModalButtonCancel: '否',
		ConfirmButtonOk: '确定',
		ConfirmButtonCancel: '取消',
		modalPreloaderTitle: '等待中'
	},
	SYSTEM_CODE: {
	    '1000': '成功',
	    '1001': '暂无数据',
	    '1002': '服务器繁忙,请稍后重试',
	    '1003': '不需要重新上传',
	    '1004': '后台数据处理异常',
	    '1005': '您已关注',
	    '1006': '你提交的视频还在审核中或你已被禁止上传视频',
	    '1007': '余额不足,请先充值',
	    '1008': '失败,已经存在该数据',
	    '1009': '该用户已被冻结',
	    '1010': '访问限制',
	    '2000': '请求频率过高，无效请求',
	    '2001': '发送验证码失败',
	    '2002': '传入手机号码为空',
	    '2003': '验证码错误或已失效',
	    '2004': '手机号或归属编号不能为空',
	    '2005': '注册失败,该手机号已注册',
	    '2006': '验证码不能为空',
	    '2007': '修改新密码失败',
	    '2008': '账户不能为空或不存在该账户',
	    '2009': '登入失败,密码错误',
	    '2010': '请检查提交的参数',
	    '2011': '不存在该账户或该账户异常',
	    '2012': 'token失效,请重新登入',
	    '2013': '你还不是主播或你已被禁播',
	    '2014': '创建失败',
	    '2015': '加入失败,请检查该频道是否还存在',
	    '2016': '关闭失败,请检查该频道是否还存在',
	    '2017': '评价太频繁,请稍后尝试',
	    '2018': '读取数据失败,请联系开发人员',
	    '2019': '修改个人资料失败',
	    '2020': '上传头像失败',
	    '2021': '上传视频失败',
	    '2022': '操作失败',
	    '2023': '生成token失败',
	    '2024': '创建订单失败',
	    '2025': '结算失败',
	    '2026': '上播失败',
	    '2027': '系统错误',
	    '2028': '删除失败',
	    '2029': '您已经评论过',
	    '2030': '点赞失败,系统繁忙,请稍后重试'
	}

}

export default Lang;