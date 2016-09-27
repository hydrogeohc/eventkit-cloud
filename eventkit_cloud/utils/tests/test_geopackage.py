# -*- coding: utf-8 -*-
import logging
import os

from mock import Mock, patch

from django.test import SimpleTestCase

from ..geopackage import SQliteToGeopackage

logger = logging.getLogger(__name__)


class TestSQliteToGeopackage(SimpleTestCase):

    def setUp(self, ):
        import eventkit_cloud.utils
        self.path = os.path.dirname(eventkit_cloud.utils.__file__)

    @patch('os.path.isfile')
    @patch('subprocess.PIPE')
    @patch('subprocess.Popen')
    def test_convert(self, popen, pipe, isfile):
        sqlite = '/path/to/query.sqlite'
        gpkgfile = '/path/to/query.gpkg'
        cmd = "ogr2ogr -f 'GPKG' {0} {1}".format(gpkgfile, sqlite)
        isfile.return_value = True
        proc = Mock()
        popen.return_value = proc
        proc.communicate.return_value = (Mock(), Mock())
        proc.wait.return_value = 0
        # set zipped to False for testing
        s2g = SQliteToGeopackage(sqlite=sqlite, gpkgfile=gpkgfile, debug=False)
        isfile.assert_called_once_with(sqlite)
        out = s2g.convert()
        popen.assert_called_once_with(cmd, shell=True, executable='/bin/bash',
                                stdout=pipe, stderr=pipe)
        proc.communicate.assert_called_once()
        proc.wait.assert_called_once()
        self.assertEquals(out, gpkgfile)
