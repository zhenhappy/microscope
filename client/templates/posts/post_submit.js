Template.postSubmit.events({
  'submit form': function(e) {
    e.preventDefault(); // 确保浏览器不会再继续尝试提交表单

    var post = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    };

    Meteor.call('postInsert', post, function(error, result) {
      // 显示错误信息并退出
      if (error)
        return alert(error.reason);
      Router.go('postPage', {_id: result._id});
    });
  }
});
