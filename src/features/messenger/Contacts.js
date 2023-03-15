import React from "react";

export function Contacts() {
	return(
		<div class="col-md-4 col-12 card-stacked">
      <div class="card shadow-line mb-3 chat">
        <div class="chat-user-detail">
          <div class="p-3 chat-header">
            <div class="w-100">
              <div class="d-flex pl-0">
                <div class="d-flex flex-row mt-1 mb-1">
                  <span class="margin-auto mr-2">
                    <a href="#" class="user-undetail-trigger btn btn-sm btn-icon btn-light active text-dark ml-2">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="feather">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </a>
                  </span>
                  <p class="margin-auto fw-400 text-dark-75">Profile</p>
                </div>
                <div>
                </div>
              </div>
            </div>
          </div>
          <div class="p-3 chat-user-info">
            <div class="card-body text-center">
              <a href="#!">
                <img src="https://user-images.githubusercontent.com/35243461/168796876-2e363a49-b32c-4218-b5a3-ce12493af69e.jpg" class="rounded-circle img-fluid shadow avatar-xxl" />
              </a>
              <div class="pt-4 text-center animate4">
                <h6 class="fw-300 mb-1">Quan Albert</h6>
                <p class="text-muted">Web Developer</p>
                <div class="mt-4">
                  <a href="#" class="btn btn-light-skype btn-icon btn-circle btn-sm btn-shadow mr-2"><i class="bx bxl-skype"></i></a>
                  <a href="#" class="btn btn-light-facebook btn-icon btn-circle btn-sm btn-shadow mr-2"><i class="bx bxl-facebook"></i></a>
                  <a href="#" class="btn btn-light-twitter btn-icon btn-circle btn-sm btn-shadow mr-2"><i class="bx bxl-twitter"></i></a>
                  <a href="#" class="btn btn-light-instagram btn-icon btn-circle btn-sm btn-shadow mr-2"><i class="bx bxl-instagram"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-3 chat-header">
          <div class="d-flex">
            <div class="w-100 d-flex pl-0">
              <img class="user-detail-trigger rounded-circle shadow avatar-sm mr-3 chat-profile-picture" src="https://user-images.githubusercontent.com/35243461/168796876-2e363a49-b32c-4218-b5a3-ce12493af69e.jpg" />
            </div>
            <div class="flex-shrink-0 margin-auto">
              <a href="#" class="btn btn-sm btn-icon btn-light active text-dark ml-2">
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="feather">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                  <polyline points="17 2 12 7 7 2"></polyline>
                </svg>
              </a>
              <a href="#" class="btn btn-sm btn-icon btn-light active text-dark ml-2">
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="feather">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </a>
              <a href="#" class="btn btn-sm btn-icon btn-light active text-dark ml-2">
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="feather">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div class="chat-search pl-3 pr-3">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Search a conversation"/>
            <div class="input-group-append prepend-white">
              <span class="input-group-text pl-2 pr-2">
                <i class="fs-17 las la-search drop-shadow"></i>
              </span>
            </div>
          </div>
        </div>
        <div class="archived-messages d-flex p-3">
          <div class="w-100">
            <div class="d-flex pl-0">
              <div class="d-flex flex-row mt-1">
                <span class="margin-auto mr-2">
                  <div class="svg15 archived"></div>
                </span>
                <p class="margin-auto fw-400 text-dark-75">Archived</p>
              </div>
              <div>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-user-panel">
          <div class="pb-3 d-flex flex-column navigation-mobile pagination-scrool chat-user-scroll">
            <div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle shadow avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796884-ee3aafb6-8083-48ec-9cfb-51b95eae08fe.jpg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">Emily Woods</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 double-check"></div>
                      </span>
                      <span class="message-shortcut margin-auto text-muted fs-13 ml-1 mr-4">I'm looking forward to it</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">08:55</p>
                  <div class="text-right d-flex flex-row">
                    <span>
                      <div class="svg18 pinned"></div>
                    </span>
                    <i class="text-muted la la-angle-down ml-1 fs-15"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="chat-item active d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle shadow avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796877-f6c8819a-5d6e-4b2a-bd56-04963639239b.jpg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">Beate Lemoine</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 double-check"></div>
                      </span>
                      <span class="message-shortcut margin-auto fw-400 fs-13 ml-1 mr-4">Hey Quan, If you are free now we can meet tonight ?</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">08:21</p>
                  <span class="round badge badge-light-success margin-auto">2</span>
                </div>
              </div>
            </div>
            <div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle shadow avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796879-f8c5e585-15c0-49ff-94de-c70539ae434c.jpg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">Tessa Nau</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 single-check"></div>
                      </span>
                      <span class="message-shortcut margin-auto text-muted fs-13 ml-1 mr-4">No that's everyhing, thanks again! </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">04:21</p>
                </div>
              </div>
            </div>
            <div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle shadow avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796872-7251e655-cdf0-4031-a253-bf0db09cdf0f.jpg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">Eric Campos</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 double-check-blue"></div>
                      </span>
                      <span class="message-shortcut margin-auto text-muted fs-13 ml-1 mr-4">So cool, I'll let you know if anything else is needed </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">03:47</p>
                </div>
              </div>
            </div>
            <div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796904-de09be7a-511c-4ae6-8312-4e81b8721555.svg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">Lone Rangers</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 double-check-blue"></div>
                      </span>
                      <span class="message-shortcut margin-auto text-muted fs-13 ml-1 mr-4">
                        <div class="d-flex flex-row text-muted">
                          <span>Diego</span>:
                          <span class="message-shortcut margin-auto fs-13 ml-1 mr-4">So cool, I'll let you know if anything else is needed </span>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">01:15</p>
                </div>
              </div>
            </div>
            <div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle shadow avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796882-28875c5c-424a-40d4-8f69-cfb7f18ccd14.jpg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">Luis Hamilton</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 double-check"></div>
                      </span>
                      <span class="message-shortcut margin-auto text-muted fs-13 ml-1 mr-4">no problem</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">yesterday</p>
                </div>
              </div>
            </div>
            <div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796906-ab4fc0f3-551c-4036-b455-be2dfedb9680.svg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">Joel Lehtinen</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 double-check"></div>
                      </span>
                      <span class="message-shortcut margin-auto text-muted fs-13 ml-1 mr-4">find it hard to believe you don't know</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">4.10.2021</p>
                </div>
              </div>
            </div>
            <div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle shadow avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796881-383d6cc9-a4cc-402f-b730-e9edc4e1e9b7.jpg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">James Tolonen</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 single-check"></div>
                      </span>
                      <span class="message-shortcut margin-auto text-muted fs-13 ml-1 mr-4">All your life</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">6.10.2021</p>
                </div>
              </div>
            </div>
            <div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3">
              <div class="w-100">
                <div class="d-flex pl-0">
                  <img class="rounded-circle avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796906-ab4fc0f3-551c-4036-b455-be2dfedb9680.svg" />
                  <div>
                    <p class="margin-auto fw-400 text-dark-75">Cory Bryant</p>
                    <div class="d-flex flex-row mt-1">
                      <span>
                        <div class="svg15 double-check-blue"></div>
                      </span>
                      <span class="message-shortcut margin-auto text-muted fs-13 ml-1 mr-4">12-year journey to visit more asteroids than any other</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                <div class="d-flex flex-column">
                  <p class="text-muted text-right fs-13 mb-2">1.9.2021</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

	)
}