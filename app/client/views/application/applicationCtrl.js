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
      // All this just for tech interests checkboxes fml

      var techInterests = {
        'Hardware': false,
        'Web Development': false,
        'Mobile App Development': false,
        'AI/Machine Learning': false,
        ' Data Science / Data Visualization / Data Analytics': false,
        'AR/VR': false,
        'Natural Language Processing': false,
        'UI/UX Design': false,
        'IoT': false,
        'Cybersecurity': false,
        'Human Computer Interaction': false,
        'Game Development': false,
        'CS Theory / Algorithms': false,
        'Other': false
      };

      if (user.profile.techInterests){
        user.profile.techInterests.forEach(function(techInterest){
          if (techInterest in techInterests){
            techInterests[techInterest] = true;
          }
        });
      }

      $scope.techInterests = techInterests;

      // -------------------------------

      // -------------------------------
      // Hacker experience 

      var hackerExperience = {
        'I’ve never attended a hackathon': false,
        'I’ve attended hackathons before': false,
        'I’ve never attended HackBeanpot': false,
        'I’ve attended HackBeanpot before': false,
        'I would be interested in attending a first-time hacker orientation': false
      };

      if (user.profile.hackerExperience){
        user.profile.hackerExperience.forEach(function(he){
          if (he in hackerExperience){
            hackerExperience[he] = true;
          }
        });
      }

      $scope.hackerExperience = hackerExperience;

      // -------------------------------


      // -------------------------------
      // Heard About Us

      var heardAboutUs = {
        'Friends': false,
        'Facebook': false,
        'Twitter': false,
        'Instagram': false,
        'Outreach Event': false,
        'Our Website': false,
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
      // HBP Outreach Events

      var hbpOutreachEvents = {
        'CoSMO x HBP: Intro to Hackathons (9/25)': false,
        'HBP @ Tufts PolyHack (10/11)': false,
        'HBP x WISE x NUWIT: Breaking into Data Visualization (11/3)': false
      };

      if (user.profile.hbpOutreachEvents){
        user.profile.hbpOutreachEvents.forEach(function(hoe){
          if (hoe in hbpOutreachEvents){
            hbpOutreachEvents[hoe] = true;
          }
        });
      }

      $scope.hbpOutreachEvents = hbpOutreachEvents;

      // -------------------------------

      // -------------------------------
      // All this just for dietary restriction checkboxes fml

      var dietaryRestrictions = {
        'Vegetarian': false,
        'Vegan': false,
        'Halal': false,
        'Kosher': false,
        'Nut Allergy': false,
        'Other (please specify)': false
      };

      if (user.profile.dietaryRestrictions){
        user.profile.dietaryRestrictions.forEach(function(restriction){
          if (restriction in dietaryRestrictions){
            dietaryRestrictions[restriction] = true;
          }
        });
      }

      $scope.dietaryRestrictions = dietaryRestrictions;

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
        // Get the tech interests as an array
        var tis = [];
        Object.keys($scope.techInterests).forEach(function(key){
          if ($scope.techInterests[key]){
            tis.push(key);
          }
        });
        profile.techInterests = tis;

        // Get the tech interests as an array
        var hes = [];
        Object.keys($scope.hackerExperience).forEach(function(key){
          if ($scope.hackerExperience[key]){
            hes.push(key);
          }
        });
        profile.hackerExperience = hes;
 
        // Get the heard about us as an array
        var hauArray = [];
        Object.keys($scope.heardAboutUs).forEach(function(key){
          if ($scope.heardAboutUs[key]){
            hauArray.push(key);
          }
        });
        profile.heardAboutUs = hauArray;

        // Get the hbp outreach events as an array
        var hoes = [];
        Object.keys($scope.hbpOutreachEvents).forEach(function(key){
          if ($scope.hbpOutreachEvents[key]){
            hoes.push(key);
          }
        });
        profile.hbpOutreachEvents = hoes;

        // Get the dietary restrictions as an array
        var drs = [];
        Object.keys($scope.dietaryRestrictions).forEach(function(key){
          if ($scope.dietaryRestrictions[key]){
            drs.push(key);
          }
        });
        profile.dietaryRestrictions = drs;
        

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
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school name.'
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
            gender: {
              identifier: 'gender',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a gender.'
                }
              ]
            },
            adult: {
              identifier: 'adult',
              rules: [
                {
                  type: 'allowMinors',
                  prompt: 'You must be an adult.'
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
