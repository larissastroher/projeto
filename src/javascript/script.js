const API_URL = "http://localhost/landingpage/API_landingpage_cities/backend/api"
let currentUserId = null;

$(document).ready(function() {
    $('#mobile_btn').on('click', function() {
      $('#mobile_menu').toggleClass('active');
      $('#mobile_btn').find('i').toggleClass('fa-x');
      });

  const sections = $('section');
  const navItems = $('.nav-item');

  $(window).on('scroll', function () {
    const header = $('header');
    const scrollPosition = $(window).scrollTop() - header.outerHeight();

  let activeSectionIndex = 0;

    if (scrollPosition <= 0) {
      header.css('box-shadow', 'none');
    } else {
      header.css('box-shadow', '5px 1px 5px rgba(0, 0, 0, 0.1');
    }

  sections.each(function(i) {
    const section = $(this);
    const sectionTop = section.offset().top - 96;
    const sectionBottom = sectionTop+ section.outerHeight();

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      activeSectionIndex = i;
      return false;
    }
  })

  navItems.removeClass('active');
  $(navItems[activeSectionIndex]).addClass('active');
  });

  ScrollReveal().reveal('#cta', {
    origin: 'left',
    duration: 2000,
    distance: '20%'
  })

  ScrollReveal().reveal('.dish', {
    origin: 'left',
    duration: 2000,
    distance: '20%'
  })



  function carregarCidades() {
      $('#dishes').html('<p>Carregando cidades...</p>');

      $.ajax({
          url: `${API_URL}/cities.php`,
          method: 'GET',
          dataType: 'json',
          success: function(response) {
              $('#dishes').empty();

              if (response.status === 'success' && response.data.length > 0) {
                  $.each(response.data, function(index, city) {
                      const cityCardHtml = `
                          <div class="dish">
                              <img src="${city.image || 'src/images/default-city.png'}" class="dish-image" alt="${city.name}">
                              <h3 class="dish-title">${city.name}</h3>
                              <span class="dish-description">${city.description}</span>
                              <div class="dish-rate">
                                  <i class="fa-solid fa-star"></i>
                                  <span>${parseFloat(city.rating).toFixed(1)}</span>
                              </div>
                              <div class="dish-price">
                                  <button class="btn-default">EXPLORAR</button>
                              </div>
                          </div>
                      `;
                      $('#dishes').append(cityCardHtml);
                  });
              } else {
                  $('#dishes').html('<p>Nenhuma cidade encontrada.</p>');
              }
          },
          error: function(error) {
              console.error("Erro ao buscar cidades:", error);
              $('#dishes').html('<p>Ocorreu um erro ao carregar as cidades. Tente novamente mais tarde.</p>');
          }
      });
  }

  carregarCidades();


  $('#comment-form').on('submit', function(event) {
    
    event.preventDefault(); 

    const submitButton = $(this).find('button[type="submit"]');
    submitButton.prop('disabled', true).text('Enviando...');

    const reviewData = {
        rating: parseInt($('#rating-input').val()),     
        review: $('#review-input').val(),
        
        users_id: 1,
        cities_id: 1
    };

    if (!reviewData.review || !reviewData.rating) {
        $('#comment-feedback').text('Por favor, preencha a nota e o comentário.').css('color', 'red');
        submitButton.prop('disabled', false).text('Enviar');
        return; 
    }

    $.ajax({
        url: `${API_URL}/reviews.php`, 
        method: 'POST',
        contentType: 'application/json', 
        data: JSON.stringify(reviewData), 
        
        success: function(response) {
            if (response.status === 'success') {
                $('#comment-feedback').text(response.message).css('color', 'green');
                $('#comment-form')[0].reset(); 
            } else {
                $('#comment-feedback').text(response.message || 'Ocorreu um erro.').css('color', 'red');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Erro ao enviar avaliação:", textStatus, errorThrown);
            $('#comment-feedback').text('Não foi possível enviar sua avaliação. Tente novamente.').css('color', 'red');
        },
        complete: function() {
            submitButton.prop('disabled', false).text('Enviar');
        }
    });
});



function updateUserMenu() {
        const authToken = localStorage.getItem('authToken');

        const loginLi = $('#login-link-li');
        const profileLi = $('#profile-link-li');
        const logoutLi = $('#logout-link-li');

        if (authToken) {
            loginLi.addClass('hidden');
            profileLi.removeClass('hidden');
            logoutLi.removeClass('hidden');
        } else {
            loginLi.removeClass('hidden');
            profileLi.addClass('hidden');
            logoutLi.addClass('hidden');
        }
    }

    $('#logout-btn').on('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('authToken');
        alert('Você foi desconectado.');
        window.location.reload();
    });

    updateUserMenu();


function setupReviewSection() {
    const authToken = localStorage.getItem('authToken');
    const reviewArea = $('#review-area');

    if (authToken) {
        const formHtml = `
            <h2 class="section-title">Deixe sua avaliação</h2>
            <form id="review-form">
                <div class="form-group">
                    <label for="city-select">Qual cidade você quer avaliar?</label>
                    <select id="city-select" required>
                        <option value="">Carregando cidades...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="rating-input">Sua nota (1 a 5):</label>
                    <input type="number" id="rating-input" min="1" max="5" required>
                </div>
                <div class="form-group">
                    <label for="review-textarea">Seu comentário:</label>
                    <textarea id="review-textarea" placeholder="Escreva seu comentário..." required></textarea>
                </div>
                <button type="submit" disabled>Enviar Avaliação</button>
                <div id="review-feedback"></div>
            </form>
        `;
        reviewArea.html(formHtml);
        populateCitySelect();

    } else {
        const loginMessageHtml = `
            <div class="login-prompt">
                <h2>Quer deixar sua avaliação?</h2>
                <p>Faça login para compartilhar sua experiência com outros viajantes!</p>
                <a href="login.html" class="btn-default">Fazer Login ou Cadastrar</a>
            </div>
        `;
        reviewArea.html(loginMessageHtml);
    }
}

function validateReviewForm() {
    const city = $('#city-select').val();
    const rating = $('#rating-input').val();
    const review = $('#review-textarea').val();
    const submitButton = $('#review-form button[type="submit"]');

    if (city && rating && review) {
        submitButton.prop('disabled', false);
    } else {
        submitButton.prop('disabled', true);
    }
}

$('body').on('input change', '#review-form', function() {
    validateReviewForm();
});

$('body').on('submit', '#review-form', function(e) {
    e.preventDefault();
    const authToken = localStorage.getItem('authToken');
    const feedbackDiv = $('#review-feedback');

    const reviewData = {
        cities_id: $('#city-select').val(),
        rating: $('#rating-input').val(),
        review: $('#review-textarea').val()
    };

    console.log("Enviando estes dados para a API:", reviewData); 
    
    $.ajax({
        url: `${API_URL}/reviews.php`, 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`
        },
        contentType: 'application/json',
        data: JSON.stringify(reviewData),
        success: function(response) {
            feedbackDiv.text(response.message).css('color', 'green');
            $('#review-form')[0].reset();
            loadLatestReviews();
            validateReviewForm()
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : 'Erro ao enviar. Tente novamente.';
            feedbackDiv.text(errorMsg).css('color', 'red');
        }
    });
});

setupReviewSection();



function populateCitySelect() {
    const citySelect = $('#city-select');

    if (citySelect.length === 0) {
        return;
    }

    $.ajax({
        url: `${API_URL}/cities.php`,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log("Dados recebidos da API de cidades:", response);
            const citiesArray = response.data; 

            citySelect.empty();
            citySelect.append('<option value="" disabled selected>Selecione uma cidade</option>');

            citiesArray.forEach(function(city) {
                const optionHtml = `<option value="${city.id}">${city.name}</option>`;
                citySelect.append(optionHtml);
            });
        },
        error: function() {
            console.error('Erro ao carregar cidades para o formulário de avaliação.');
            citySelect.empty();
            citySelect.append('<option value="">Não foi possível carregar as cidades</option>');
        }
    });
}


function loadLatestReviews() {
    const reviewsContainer = $('#reviews-list-container');
    reviewsContainer.html('<p>Carregando últimas avaliações...</p>');

    $.ajax({
        url: `${API_URL}/latest_reviews.php`,
        method: 'GET',
        dataType: 'json',
        success: function(reviews) {
            const authToken = localStorage.getItem('authToken');
            
            function renderReviews() {
                reviewsContainer.empty();
                if (!reviews || reviews.length === 0) {
                    reviewsContainer.html('<p>Ainda não há avaliações. Seja o primeiro!</p>');
                    return;
                }

                reviews.forEach(function(review) {
                    let stars = '';
                    for (let i = 0; i < 5; i++) {
                        stars += `<i class="fa-solid fa-star${i < review.rating ? '' : '-regular'}"></i>`;
                    }

                    let deleteButton = '';
                    if (currentUserId && review.user_id === currentUserId) {
                        deleteButton = `<button class="delete-review-btn" data-review-id="${review.review_id}">Excluir</button>`;
                    }

                    const reviewCardHtml = `
                        <div class="review-card" id="review-${review.review_id}">
                            <div class="review-card-header">
                                <span class="review-card-user">${review.user_name} ${review.user_lastname}</span>
                                <span class="review-card-rating">${stars}</span>
                            </div>
                            <p class="review-card-body">${review.review}</p>
                            <div class="review-card-footer">
                                <span>- Avaliando ${review.city_name}</span>
                                ${deleteButton}
                            </div>
                        </div>
                    `;
                    reviewsContainer.append(reviewCardHtml);
                });
            }

            if (authToken) {
                $.ajax({
                    url: `${API_URL}/user.php`,
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    success: function(user) {
                        currentUserId = user.id; 
                    },
                    complete: function() {
                        renderReviews(); 
                    }
                });
            } else {
                currentUserId = null;
                renderReviews();
            }
        },
        error: function() {
            reviewsContainer.html('<p>Não foi possível carregar as avaliações.</p>');
        }
    });
}

setupReviewSection();
loadLatestReviews(); 

$('body').on('click', '.delete-review-btn', function() {
        const reviewId = $(this).data('review-id');
        const authToken = localStorage.getItem('authToken');

        if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
            $.ajax({
                url: `${API_URL}/review_delete.php`,
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                contentType: 'application/json',
                data: JSON.stringify({ review_id: reviewId }),
                success: function(response) {
                    alert(response.message);
                    $(`#review-${reviewId}`).fadeOut(500, function() { $(this).remove(); });
                    loadLatestReviews();
                    validateReviewForm();
                },
                error: function(xhr) {
                    const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : 'Ocorreu um erro.';
                    alert(`Erro: ${errorMsg}`);
                }
            });
        }
    });

});