Template.postSubmit.onCreated(function() {
  Session.set('postSubmitErrors', {});
});

Template.postSubmit.helpers({
  errorMessage: function(field) {
    return Session.get('postSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('postSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.postSubmit.events({
  'submit form': function(e) {
    e.preventDefault(); // 确保浏览器不会再继续尝试提交表单

    var post = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    };

    var errors = validatePost(post);
    if (errors.title || errors.url)
      return Session.set('postSubmitErrors', errors);

    Meteor.call('postInsert', post, function(error, result) {
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
  }
});
