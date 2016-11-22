# -*- coding: utf-8 -*-
"""UI view definitions."""
import json
from django.conf import settings
from django.contrib.auth import logout as auth_logout
from django.core.urlresolvers import reverse
from django.shortcuts import RequestContext, redirect, render_to_response
from django.template.context_processors import csrf
from django.views.decorators.http import require_http_methods
from ..jobs.models import user_owns_job
from functools import wraps
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .data_estimator import get_size_estimate


def user_verification_required(func=None):
    """

    :param func: A view with a signature (request, uuid) where uuid is a job_uid.
    :return: The view if the user is authorized, else an unauthorized view.
    """
    @wraps(func)
    def wrapper(request, uuid):
        # if user_owns_job(request.user, job_uid=uuid):
            return func(request, uuid)
        # else:
        #     return not_allowed_error_view(request)
    return wrapper


@require_http_methods(['GET'])
def create_export(request):
    """
    Handles display of the create export page.
    """
    user = request.user
    max_extent = {'extent': settings.JOB_MAX_EXTENT}
    for group in user.groups.all():
        if hasattr(group, 'export_profile'):
            max_extent['extent'] = group.export_profile.max_extent
    extent = max_extent.get('extent')
    context = {'user': user, 'max_extent': extent}
    context.update(csrf(request))
    return render_to_response('ui/create.html', context, RequestContext(request))


@user_verification_required
@require_http_methods(['GET'])
def clone_export(request, uuid=None):
    """
    Handles display of the clone export page.
    """
    user = request.user
    max_extent = {'extent': settings.JOB_MAX_EXTENT}  # default
    user = request.user
    for group in user.groups.all():
        if hasattr(group, 'export_profile'):
            max_extent['extent'] = group.export_profile.max_extent
    extent = max_extent.get('extent')
    context = {'user': user, 'max_extent': extent}
    context.update(csrf(request))
    return render_to_response('ui/clone.html', context, RequestContext(request))


@user_verification_required
@require_http_methods(['GET'])
def view_export(request, uuid=None):
    """
    Handles display of the clone export page.
    """
    user = request.user
    context = {'user': user}
    return render_to_response('ui/detail.html', context, RequestContext(request))


def login(request):
    exports_url = reverse('list')
    help_url = reverse('help')
    if not request.user.is_authenticated():
        return redirect('login')
    else:
        return not_allowed_error_view(request)


def logout(request):
    """Logs out user"""
    exports_url = reverse('list')
    help_url = reverse('help')
    auth_logout(request)
    return redirect('login')

def require_email(request):
    """
    View to handle email collection for new user loging in with OSM account.
    """
    backend = request.session['partial_pipeline']['backend']
    return render_to_response('osm/email.html', {'backend': backend}, RequestContext(request))


@require_http_methods(['GET'])
def about(request):
    exports_url = reverse('list')
    help_url = reverse('help')
    return render_to_response(
        'ui/about.html',
        {'exports_url': exports_url, 'help_url': help_url},
        RequestContext(request)
    )


@require_http_methods(['GET'])
def help_main(request):
    return render_to_response('help/help.html', {}, RequestContext(request))


@require_http_methods(['GET'])
def help_create(request):
    create_url = reverse('create')
    help_features_url = reverse('help_features')
    return render_to_response(
        'help/help_create.html',
        {'create_url': create_url, 'help_features_url': help_features_url},
        RequestContext(request)
    )


@require_http_methods(['GET'])
def help_features(request):
    return render_to_response(
        'help/help_features.html', {}, RequestContext(request)
    )


@require_http_methods(['GET'])
def help_exports(request):
    help_main_url = reverse('help')
    export_url = reverse('list')
    return render_to_response(
        'help/help_exports.html', {'export_url': export_url}, RequestContext(request)
    )


@require_http_methods(['GET'])
def help_formats(request):
    return render_to_response(
        'help/help_formats.html', {}, RequestContext(request)
    )


@require_http_methods(['GET'])
def help_presets(request):
    configurations_url = reverse('configurations')
    return render_to_response(
        'help/help_presets.html',
        {'configurations_url': configurations_url},
        RequestContext(request)
    )

@csrf_exempt
@require_http_methods(['POST'])
def data_estimator(request):
    request_data = json.loads(request.body)
    # example request_data = {'providers': ['ESRI-Imagery'], 'bbox': [-43.238239, -22.933733, -43.174725, -22.892623]}
    size = []
    tiles = []
    providers = request_data.get('providers')
    bbox = request_data.get('bbox')
    tiles_ = []
    if not providers and not bbox:
        return HttpResponse("Providers or BBOX were not supplied in the request", status=400)

    for provider in providers:
        estimates = get_size_estimate(provider, bbox)
        tiles.append(estimates[0])
        size.append(estimates[1])
        # tiles += estimates[0]
        # size += estimates[1]
        tiles_.append(estimates[2])
        bbox = estimates[3]
    return HttpResponse(json.dumps([tiles, size, tiles_, bbox]))
    return HttpResponse([size])



# error views


@require_http_methods(['GET'])
def create_error_view(request):
    return render_to_response('ui/error.html', {}, RequestContext(request), status=500)


def internal_error_view(request):
    return render_to_response('ui/500.html', {}, RequestContext(request), status=500)


def not_found_error_view(request):
    return render_to_response('ui/404.html', {}, RequestContext(request), status=404)


def not_allowed_error_view(request):
    return render_to_response('ui/403.html', {}, RequestContext(request), status=403)


