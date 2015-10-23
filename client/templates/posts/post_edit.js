Template.postEdit.events({
  'submit form': function(e) {
    e.preventDefault();

    var currentPostId = this._id;

    var postProperties = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    }

    Meteor.call('postUpdate', currentPostId, postProperties, function(error, result) {
      // 显示错误信息并退出
      if (error)
        return throwError(error.reason);

      // 用户非法越界操作
      if (result.userInvalid)
        return throwError('User\'s illegal operation（用户非法越界操作）');

      // 显示结果，跳转页面
      if (result.postExists)
        return throwError('This link has already been posted（该链接已经存在）');

      Router.go('postsList');
    });
  },

  'click .delete': function(e) {
    e.preventDefault();

    if (confirm("Delete this post?")) {
      var currentPostId = this._id;
      Posts.remove(currentPostId);
      Router.go('postsList');
    }
  }
});
