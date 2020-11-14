const angular = require("angular");
const swal = require("sweetalert");

angular.module('reg')
  .controller('ApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function($scope, $rootScope, $state, $http, currentUser, settings, Session, UserService) {

      // Set up the user
      var user = currentUser.data;
      $scope.user = user;

      // -------------------------------
      // All this just for activity interests checkboxes fml

      var activityInterests = {
        'Meeting other hackers in camper cabins': false,
        'Winning the Cabin Cup by attending workshops + activities': false,
        'Project ideation/team formation': false,
        'Intro to Git and Working With a Team Remotely': false,
        'Hackathons for Resumes': false,
        'How to Demo a Project for Judging': false,
        'Careers in Tech': false,
        'Diversity in Tech': false,
        'Tech for Social Good': false,
        'Other': false
      };

      if (user.profile.activityInterests){
        user.profile.activityInterests.forEach(function(techInterest){
          if (techInterest in activityInterests){
            activityInterests[techInterest] = true;
          }
        });
      }

      $scope.activityInterests = activityInterests;


      // -------------------------------
      // Heard About Us

      var heardAboutUs = {
        'Friends': false,
        'Facebook': false,
        'Twitter': false,
        'Instagram': false,
        'HackBeanpot Outreach Event': false,
        'Our Website': false,
        'Email/Newsletter': false,
        'Blog Post': false,
        'Other': false
      };

      if (user.profile.heardAboutUs){
        user.profile.heardAboutUs.forEach(function(hau){
          if (hau in heardAboutUs){
            heardAboutUs[hau] = true;
          }
        });
      }

      $scope.heardAboutUs = heardAboutUs;

      // -------------------------------

      // -------------------------------
      // Populate the school dropdown
      populateSchools();
      _setupForm();

      $scope.regIsClosed = Date.now() > settings.data.timeClose;

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){
        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.user.email.split('@')[1];

            if (schools[email]){
              $scope.user.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }
          });

        $http
          .get('/assets/schools.csv')
          .then(function(res){
            $scope.schools = res.data.split('\n');
            $scope.schools.push('Other');

            var content = [];

            for(i = 0; i < $scope.schools.length; i++) {
              $scope.schools[i] = $scope.schools[i].trim();
              content.push({title: $scope.schools[i]})
            }

            $('#school.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.user.profile.school = result.title.trim();
                }
              })
          });
      }

      function _updateUser(e){
        var profile = $scope.user.profile;
        // Get the activity interests as an array
        var tis = [];
        Object.keys($scope.activityInterests).forEach(function(key){
          if ($scope.activityInterests[key]){
            tis.push(key);
          }
        });
        profile.activityInterests = tis;
 
        // Get the heard about us as an array
        var hauArray = [];
        Object.keys($scope.heardAboutUs).forEach(function(key){
          if ($scope.heardAboutUs[key]){
            hauArray.push(key);
          }
        });
        profile.heardAboutUs = hauArray;
        

        UserService
          .updateProfile(Session.getUserId(), profile)
          .then(response => {
            swal("Awesome!", "Your application has been saved.", "success").then(value => {
              $state.go("app.dashboard");
            });
          }, response => {
            swal("Uh oh!", "Something went wrong.", "error");
          });
      }

      function isMinor() {
        return !$scope.user.profile.adult;
      }

      function minorsAreAllowed() {
        return settings.data.allowMinors;
      }

      function minorsValidation() {
        // Are minors allowed to register?
        if (isMinor() && !minorsAreAllowed()) {
          return false;
        }
        return true;
      }

      function _setupForm(){
        // Custom minors validation rule
        $.fn.form.settings.rules.allowMinors = function (value) {
          return minorsValidation();
        };

        // Semantic-UI form validation
        $('.ui.form').form({
          inline: true,
          fields: {
            name: {
              identifier: 'name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your name.'
                }
              ]
            },
            gender: {
              identifier: 'gender',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a gender.'
                }
              ]
            },
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school name.'
                }
              ]
            },
            educationLevel: {
              identifier: 'educationLevel',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your education level.'
                }
              ]
            },
            year: {
              identifier: 'year',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your graduation year.'
                }
              ]
            },
            hackathonsAttended: {
              identifier: 'hackathonsAttended',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select the number of hackathons you have attended.'
                }
              ]
            },
            adult: {
              identifier: 'adult',
              rules: [
                {
                  type: 'allowMinors',
                  prompt: 'You must be an adult, or an MIT student.'
                }
              ]
            }
          }
        });
      }

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };
      
    }]);
